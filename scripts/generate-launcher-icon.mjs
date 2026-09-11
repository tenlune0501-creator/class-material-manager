/**
 * CMM Tutor 바탕화면 바로가기용 .ico 생성 — 1회성 스크립트(런타임에 쓰이지 않는다).
 *
 * 새 아이콘을 그리지 않는다 — 기존 PWA 아이콘(viewer/public/icon-192.png)을 그대로
 * ICO 컨테이너에 담기만 한다("PNG를 담은 ICO"는 Windows Vista 이후 표준 지원 형식).
 * sharp 등 새 의존성을 추가하지 않고 Node 내장 fs만 쓴다.
 *
 * 실행: node scripts/generate-launcher-icon.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const pngPath = join(repoRoot, "viewer", "public", "icon-192.png");
const icoPath = join(repoRoot, "cmm-tutor.ico");

const png = readFileSync(pngPath);

// ICONDIR (6 bytes): reserved=0, type=1(icon), count=1
const iconDir = Buffer.alloc(6);
iconDir.writeUInt16LE(0, 0);
iconDir.writeUInt16LE(1, 2);
iconDir.writeUInt16LE(1, 4);

// ICONDIRENTRY (16 bytes)
const entry = Buffer.alloc(16);
entry.writeUInt8(192, 0); // width
entry.writeUInt8(192, 1); // height
entry.writeUInt8(0, 2); // color count (0 = true color)
entry.writeUInt8(0, 3); // reserved
entry.writeUInt16LE(1, 4); // color planes
entry.writeUInt16LE(32, 6); // bits per pixel
entry.writeUInt32LE(png.length, 8); // size of image data
entry.writeUInt32LE(6 + 16, 12); // offset to image data

writeFileSync(icoPath, Buffer.concat([iconDir, entry, png]));
console.log(`Wrote ${icoPath} (${png.length + 22} bytes)`);
