#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    fs::{self, File},
    io::{Read, Write},
    net::TcpStream,
    path::Path,
    process::{Child, Command, Stdio},
    sync::Mutex,
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use tauri::webview::{NewWindowResponse, PermissionKind, PermissionResponse};
#[cfg(windows)]
use std::os::windows::process::CommandExt;

struct Runtime(Mutex<Option<Child>>);
impl Runtime {
    fn stop(&self) {
        if let Ok(mut guard) = self.0.lock() {
            if let Some(mut child) = guard.take() {
                let _ = child.kill();
                let _ = child.wait();
            }
        }
    }
}
impl Drop for Runtime { fn drop(&mut self) { self.stop(); } }

fn is_ready(port: u16, launch_id: &str) -> bool {
    let Ok(mut stream) = TcpStream::connect_timeout(
        &format!("127.0.0.1:{port}").parse().unwrap(), Duration::from_millis(300),
    ) else { return false; };
    let _ = stream.set_read_timeout(Some(Duration::from_millis(500)));
    let _ = stream.set_write_timeout(Some(Duration::from_millis(500)));
    if write!(stream, "GET /__cmm_desktop/ready HTTP/1.1\r\nHost: 127.0.0.1:{port}\r\nConnection: close\r\n\r\n").is_err() { return false; }
    let mut response = String::new();
    stream.take(4096).read_to_string(&mut response).is_ok()
        && response.starts_with("HTTP/1.1 200")
        && response.split("\r\n\r\n").nth(1) == Some(launch_id)
}

fn main() {
    let app = tauri::Builder::default()
        .manage(Runtime(Mutex::new(None)))
        .setup(|app| {
            let dev = cfg!(debug_assertions);
            let port = if dev { 4318 } else { 4319 };
            let origin = format!("http://127.0.0.1:{port}");
            let allowed = origin.clone();
            let profile = app.path().app_local_data_dir()?.join(if dev { "webview-dev" } else { "webview-build" });
            fs::create_dir_all(&profile)?;
            let window = WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                .title("Class Material Manager")
                .inner_size(1440.0, 960.0)
                .min_inner_size(800.0, 600.0)
                .data_directory(profile)
                .on_navigation(move |url| {
                    url.origin().ascii_serialization() == allowed
                        || url.as_str() == "http://tauri.localhost/"
                        || url.as_str() == "http://tauri.localhost/index.html"
                        || url.as_str() == "tauri://localhost/index.html"
                })
                .on_new_window(|_, _| NewWindowResponse::Deny)
                // WebView2 retains the user's own microphone decision. No auto-grant.
                .on_permission_request(|_, kind| match kind {
                    PermissionKind::Microphone | PermissionKind::Autoplay => PermissionResponse::Default,
                    _ => PermissionResponse::Deny,
                })
                .on_document_title_changed(|window, _| { let _ = window.set_title("Class Material Manager"); })
                .build()?;

            // This PoC is explicitly tied to the checkout used to compile it.
            // It is not a portable installer. Release additionally pins Next BUILD_ID.
            let root = Path::new(env!("CARGO_MANIFEST_DIR")).parent().unwrap();
            let logs = root.join("desktop/.runtime");
            fs::create_dir_all(&logs)?;
            let output = File::create(logs.join(if dev { "dev.log" } else { "build.log" }))?;
            let launch_id = format!("{}-{}", std::process::id(), SystemTime::now().duration_since(UNIX_EPOCH)?.as_nanos());
            let mut command = Command::new(env!("CMM_NODE_PATH"));
            command.arg(root.join("desktop/server.mjs"))
                .args([if dev { "dev" } else { "production" }, &port.to_string(), &launch_id, env!("CMM_BUILD_ID")])
                .current_dir(root)
                .stdin(Stdio::piped())
                .stdout(output.try_clone()?)
                .stderr(output);
            #[cfg(windows)]
            command.creation_flags(0x08000000); // CREATE_NO_WINDOW for the helper only.
            let child = command.spawn()?;
            *app.state::<Runtime>().0.lock().unwrap() = Some(child);
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                for _ in 0..240 {
                    let alive = handle.state::<Runtime>().0.lock().unwrap().as_mut()
                        .map(|child| matches!(child.try_wait(), Ok(None))).unwrap_or(false);
                    if !alive { break; }
                    if is_ready(port, &launch_id) {
                        let _ = window.navigate(format!("{origin}/__cmm_desktop/start").parse().unwrap());
                        return;
                    }
                    std::thread::sleep(Duration::from_millis(500));
                }
                handle.state::<Runtime>().stop();
                let _ = window.eval("document.body.textContent = 'CMM Desktop 실행 실패. desktop/.runtime 로그를 확인하세요. 포트 충돌 또는 빌드 불일치 시 기존 서버에 연결하지 않습니다.'");
            });
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("Failed to initialize CMM Desktop");
    app.run(|handle, event| {
        if matches!(event, tauri::RunEvent::Exit) { handle.state::<Runtime>().stop(); }
    });
}
