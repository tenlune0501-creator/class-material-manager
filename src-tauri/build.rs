fn main() {
    println!("cargo:rerun-if-env-changed=CMM_NODE_PATH");
    println!("cargo:rerun-if-env-changed=CMM_BUILD_ID");
    let node = std::env::var("CMM_NODE_PATH").expect("Use npm run desktop:dev or desktop:build");
    println!("cargo:rustc-env=CMM_NODE_PATH={node}");
    println!("cargo:rustc-env=CMM_BUILD_ID={}", std::env::var("CMM_BUILD_ID").unwrap_or_default());
    tauri_build::build()
}
