/**
 * Standalone Build Script
 * 모든 CSS/JS/JSON을 각 HTML 파일에 인라인하여
 * 서버 없이 file:// 프로토콜로 실행 가능한 standalone HTML 생성
 *
 * Usage: node build.js
 * Output: dist/ 폴더
 */

const fs = require('fs');
const path = require('path');

const SRC = __dirname;
const DIST = path.join(SRC, 'dist');

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

// ─── 1. CSS: main.css @import 체인을 재귀적으로 풀어서 하나의 문자열로 ───
function resolveCSS() {
  const mainPath = path.join(SRC, 'styles', 'main.css');
  const mainCSS = fs.readFileSync(mainPath, 'utf8');
  let all = '';

  const importRe = /@import\s+['"]([^'"]+)['"]\s*;/g;
  let m;
  while ((m = importRe.exec(mainCSS)) !== null) {
    const cssFile = path.join(SRC, 'styles', m[1]);
    if (fs.existsSync(cssFile)) {
      let content = fs.readFileSync(cssFile, 'utf8');
      // @font-face url 경로를 무효화 (폰트 파일 미존재, fallback 사용)
      content = content.replace(/src:\s*url\([^)]+\)[^;]*;/g,
        'src: local("Wooridaum");');
      all += `/* ${m[1]} */\n${content}\n`;
    }
  }
  return all;
}

// ─── 2. JSON 데이터 파일 읽기 ───
function readJSONData() {
  const dir = path.join(SRC, 'data');
  const data = {};
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const key = f.replace('.json', '');
    data[key] = fs.readFileSync(path.join(dir, f), 'utf8').trim();
  }
  return data;
}

// ─── 3. 공통 JS 모듈 읽기 (의존순서대로, import/export 제거, standalone 패치) ───
function readCommonJS() {
  const dir = path.join(SRC, 'js', 'common');
  const order = [
    'state-manager.js',
    'demo-navigator.js',
    'demo-indicator.js',
    'demo-engine.js',
  ];
  let combined = '';
  for (const f of order) {
    let src = fs.readFileSync(path.join(dir, f), 'utf8');
    src = src.replace(/^import\s+\{[^}]*\}\s+from\s+['"][^'"]+['"]\s*;\s*$/gm, '');
    src = src.replace(/^export\s+/gm, '');
    combined += `// ── ${f} ──\n${src}\n`;
  }

  // ── standalone 패치: sessionStorage fallback ──
  // 먼저 sessionStorage → _storage 치환
  combined = combined.replace(/sessionStorage\.getItem/g, '_storage.getItem');
  combined = combined.replace(/sessionStorage\.setItem/g, '_storage.setItem');
  combined = combined.replace(/sessionStorage\.removeItem/g, '_storage.removeItem');
  // 그 다음 _storage 선언 삽입 (내부에서 sessionStorage 원본 참조)
  combined = combined.replace(
    `const STATE_KEY = 'wb_demo_state';`,
    `const STATE_KEY = 'wb_demo_state';
const _memoryStore = {};
const _storage = (() => {
  try { sessionStorage.setItem('__test', '1'); sessionStorage.removeItem('__test'); return sessionStorage; }
  catch(e) { return { getItem: k => _memoryStore[k]||null, setItem: (k,v) => { _memoryStore[k]=v; }, removeItem: k => { delete _memoryStore[k]; } }; }
})();`
  );

  // ── standalone 패치: file:// 에서 안전한 상대경로 네비게이션 ──
  combined = combined.replace(
    `this._fadeOutAndNavigate(getBasePath() + target);`,
    `this._fadeOutAndNavigate(target);`
  );
  combined = combined.replace(
    `this._fadeOutAndNavigate(getBasePath() + np + '.html');`,
    `this._fadeOutAndNavigate(np + '.html');`
  );

  return combined;
}

// ─── 4. 페이지 HTML → standalone 변환 ───
function transformPage(htmlPath, allCSS, jsonData, commonJS) {
  let html = fs.readFileSync(htmlPath, 'utf8');

  // (a) <link stylesheet> → <style>
  html = html.replace(
    /<link\s+rel="stylesheet"\s+href="[^"]*main\.css"\s*\/?>/i,
    `<style>\n${allCSS}</style>`
  );

  // (b) <script type="module"> → inline <script>
  const scriptRe = /<script\s+type="module">([\s\S]*?)<\/script>/;
  const sm = html.match(scriptRe);
  if (!sm) return html;

  let pageJS = sm[1];

  // data import 추출 → JSON inline
  const dataVars = {};
  const dimRe = /import\s*\{\s*(\w+)\s*\}\s*from\s*['"]\.\.\/data\/([^'"]+)\.js['"]\s*;/g;
  let dm;
  while ((dm = dimRe.exec(pageJS)) !== null) {
    dataVars[dm[1]] = dm[2]; // varName → jsonKey
  }

  // import 문 전부 제거
  pageJS = pageJS.replace(/^import\s+.*;\s*$/gm, '');

  // data 변수 선언
  let dataDecl = '';
  for (const [varName, jsonKey] of Object.entries(dataVars)) {
    if (jsonData[jsonKey]) {
      dataDecl += `const ${varName} = ${jsonData[jsonKey]};\n`;
    }
  }

  // 전체 스크립트 조립 (async IIFE로 래핑하여 await 사용 가능)
  const fullScript = [
    '(async () => {',
    '  "use strict";',
    commonJS,
    dataDecl,
    pageJS,
    '})();',
  ].join('\n');

  html = html.replace(scriptRe, `<script>\n${fullScript}\n</script>`);

  // (c) Fix image paths: ../assets/ → assets/
  html = html.replace(/\.\.\/assets\//g, 'assets/');

  return html;
}

// ─── Main ───
console.log('Building standalone HTML files...\n');

const allCSS = resolveCSS();
const jsonData = readJSONData();
const commonJS = readCommonJS();

const pagesDir = path.join(SRC, 'pages');
const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
let count = 0;

for (const page of pages) {
  const html = transformPage(path.join(pagesDir, page), allCSS, jsonData, commonJS);
  fs.writeFileSync(path.join(DIST, page), html, 'utf8');
  const size = (Buffer.byteLength(html) / 1024).toFixed(1);
  console.log(`  ${page.padEnd(12)} ${size} KB`);
  count++;
}

// index.html (리다이렉트)
const indexHTML = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>기업부동산담보대출 AI Agent 시연</title>
  <meta http-equiv="refresh" content="0;url=p0.html" />
  <style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0A1628;color:#fff;font-family:"Malgun Gothic",sans-serif;font-size:18px}</style>
</head>
<body><p>시연 화면으로 이동 중...</p></body>
</html>`;
fs.writeFileSync(path.join(DIST, 'index.html'), indexHTML, 'utf8');
count++;

// ─── 5. Copy assets (images, fonts) ───
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  let copied = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copied += copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      copied++;
    }
  }
  return copied;
}

const assetsSrc = path.join(SRC, 'assets');
const assetsDest = path.join(DIST, 'assets');
const assetCount = copyDir(assetsSrc, assetsDest);
console.log(`  assets: ${assetCount} files copied`);

console.log(`\n✓ ${count} HTML files + ${assetCount} asset files → dist/`);
console.log('  서버 없이 dist/index.html (또는 p0.html) 을 브라우저에서 직접 열면 시연이 시작됩니다.');
