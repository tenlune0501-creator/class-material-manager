/**
 * PWA 아이콘 생성 — 1회성 스크립트 (앱 런타임에는 쓰이지 않는다).
 *
 * public/icon.svg 하나를 소스로 두고 sharp(Next.js 이미지 최적화가 이미 의존하는
 * 패키지 — 새 의존성 추가 아님)로 192/512(any)와 512(maskable, 안전영역 확보),
 * apple-touch-icon(180)을 만든다.
 *
 * 실행: node scripts/generate-pwa-icons.mjs
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
mkdirSync(publicDir, { recursive: true });

const TEAL = "#0d9488";

// any(192/512): 배경 꽉 채움. maskable: 아이콘을 안전영역(가운데 ~66%)에 축소 배치.
const svgAny = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="${TEAL}"/>
  <text x="256" y="300" font-family="Arial, sans-serif" font-size="220" font-weight="700"
        fill="#ffffff" text-anchor="middle">CM</text>
</svg>`;

const svgMaskable = () => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${TEAL}"/>
  <text x="256" y="290" font-family="Arial, sans-serif" font-size="170" font-weight="700"
        fill="#ffffff" text-anchor="middle">CM</text>
</svg>`;

const svgAppleTouch = () => `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${TEAL}"/>
  <text x="256" y="300" font-family="Arial, sans-serif" font-size="220" font-weight="700"
        fill="#ffffff" text-anchor="middle">CM</text>
</svg>`;

async function main() {
  await sharp(Buffer.from(svgAny(512))).resize(192, 192).png().toFile(join(publicDir, "icon-192.png"));
  await sharp(Buffer.from(svgAny(512))).resize(512, 512).png().toFile(join(publicDir, "icon-512.png"));
  await sharp(Buffer.from(svgMaskable())).resize(512, 512).png().toFile(join(publicDir, "icon-512-maskable.png"));
  await sharp(Buffer.from(svgAppleTouch())).resize(180, 180).png().toFile(join(publicDir, "apple-touch-icon.png"));
  console.log("PWA icons written to public/");
}

main();
