#!/usr/bin/env node
/**
 * 建置期把文章裡的 {{< d2 >}} 區塊渲染成 SVG。
 *
 * 為什麼要有這支腳本：
 *   Hugo 不會呼叫外部程式，圖沒辦法在模板裡直接渲染。
 *   這支在 hugo build 之前跑，替每個 d2 區塊算一個內容雜湊，
 *   渲染成 assets/diagrams/d2-<hash>.svg；shortcode 再用同樣的雜湊取檔案。
 *   內容沒變 → 雜湊一樣 → 沿用舊檔不重算。
 *
 * 為什麼選建置期而不是瀏覽器端：
 *   訪客端零 JavaScript，關掉 JS 也看得到圖，也沒有 CDN 依賴。
 *
 * 深色模式：
 *   D2 產出的 SVG 內建 `@media screen and (prefers-color-scheme:dark)`，
 *   但這個站可以用右下角按鈕「手動」切主題（body.colorscheme-dark / -light / -auto）。
 *   只靠 prefers-color-scheme 的話，「手動切淺色但系統是深色」會變成
 *   頁面淺色、圖深色。retargetDarkCss() 把那段規則改寫成同時吃
 *   body.colorscheme-dark，並把原本的 media query 限縮到 .colorscheme-auto。
 *   這只有在 SVG 被「行內嵌入」時才成立，所以 shortcode 用 inline 而不是 <img>。
 */
import { D2 } from '@terrastruct/d2';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const OUTDIR = path.join(ROOT, 'assets', 'diagrams');

const OPEN = /\{\{<\s*d2([^>]*?)>\}\}/g;   // {{< d2 sketch="true" theme="1" >}}
const CLOSE = '{{< /d2 >}}';

const DEFAULTS = { layout: 'dagre', theme: '0', darkTheme: '200', sketch: 'false', pad: '12', scale: '' };

function parseAttrs(raw) {
  const o = {};
  for (const m of raw.matchAll(/(\w+)\s*=\s*"([^"]*)"/g)) o[m[1]] = m[2];
  return o;
}

// 屬性一律先以「字串」形式套預設值：雜湊用字串，渲染時才轉數字。
// 否則 theme="01" 在 JS 會變 1、在 Hugo 還是 "01"，兩邊雜湊就對不上。
function rawFrom(a) {
  return {
    layout: a.layout ?? DEFAULTS.layout,
    theme: a.theme ?? DEFAULTS.theme,
    darkTheme: a.darkTheme ?? DEFAULTS.darkTheme,
    sketch: a.sketch === 'true' ? 'true' : 'false',
    pad: a.pad ?? DEFAULTS.pad,
    scale: a.scale ?? DEFAULTS.scale,
  };
}

function renderOptsFrom(r) {
  return {
    themeID: Number(r.theme),
    darkThemeID: Number(r.darkTheme),
    sketch: r.sketch === 'true',
    pad: Number(r.pad),
    ...(r.scale === '' ? {} : { scale: Number(r.scale) }),
  };
}

/**
 * 雜湊必須跟 layouts/shortcodes/d2.html 算出來的位元組完全一致。
 * 刻意不用 JSON.stringify：Hugo 的 jsonify 會把 key 依字母排序、JS 依插入順序，
 * 兩邊產不出同一個字串。改成固定欄位順序、\x01 分隔的串接。
 * CRLF 也要先正規化 —— Windows 上的 .md 常是 CRLF，Hugo 的 .Inner 會照原樣帶進來。
 */
function keyFor(src, r) {
  const norm = src.replace(/\r\n/g, '\n').trim();
  const joined = [norm, r.layout, r.theme, r.darkTheme, r.sketch, r.pad, r.scale].join('\x01');
  return createHash('sha256').update(joined, 'utf8').digest('hex').slice(0, 16);
}

/**
 * D2 只在 <svg> 上放 viewBox，沒有 width/height。
 * 沒有原生尺寸的話，CSS 只能讓它填滿容器 —— 在 360px 的手機上，
 * 一張 900px 寬的圖會被壓到 320px，文字小到看不清。
 * 補上 width/height 之後就能做到：
 *   桌機 max-width:100% → 太寬才等比縮小
 *   手機 max-width:none → 維持原尺寸、改用橫向捲動，字始終看得清楚
 */
function addIntrinsicSize(svg) {
  // 只看「第一個」<svg> 標籤 —— D2 的輸出裡有巢狀 <svg>，
  // 內層那些本來就帶 width，拿整份文件去比對會誤判成「已經有了」而提早跳出。
  const open = /<svg[^>]*>/.exec(svg);
  if (!open) return svg;
  const tag = open[0];
  if (/\swidth=/.test(tag)) return svg;
  const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(tag);
  if (!vb) return svg;
  return svg.slice(0, open.index)
    + tag.replace('<svg', `<svg width="${vb[1]}" height="${vb[2]}"`)
    + svg.slice(open.index + tag.length);
}

function retargetDarkCss(svg) {
  const marker = '@media screen and (prefers-color-scheme:dark)';
  const i = svg.indexOf(marker);
  if (i === -1) return svg;
  const open = svg.indexOf('{', i + marker.length);
  if (open === -1) return svg;
  let depth = 1, j = open + 1;
  while (j < svg.length && depth > 0) {
    if (svg[j] === '{') depth++;
    else if (svg[j] === '}') depth--;
    j++;
  }
  const inner = svg.slice(open + 1, j - 1);
  const prefixWith = (p) =>
    inner.replace(/([^{}]+)\{([^{}]*)\}/g, (_, sels, decls) =>
      sels.split(',').map((s) => `${p} ${s.trim()}`).join(',') + `{${decls}}`);
  const replacement =
    prefixWith('body.colorscheme-dark') +
    `@media screen and (prefers-color-scheme:dark){${prefixWith('body.colorscheme-auto')}}`;
  return svg.slice(0, i) + replacement + svg.slice(j);
}

async function walk(dir, out = []) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

const files = await walk(CONTENT);
await fs.mkdir(OUTDIR, { recursive: true });

const blocks = [];
for (const f of files) {
  const text = await fs.readFile(f, 'utf8');
  OPEN.lastIndex = 0;
  let m;
  while ((m = OPEN.exec(text))) {
    const end = text.indexOf(CLOSE, m.index);
    if (end === -1) {
      console.error(`x ${path.relative(ROOT, f)}: 有 {{< d2 >}} 但找不到對應的 {{< /d2 >}}`);
      process.exitCode = 1;
      continue;
    }
    blocks.push({ file: f, src: text.slice(m.index + m[0].length, end), raw: rawFrom(parseAttrs(m[1])) });
  }
}

if (blocks.length === 0) {
  console.log('d2: 沒有找到圖表，略過。');
  process.exit(0);
}

const d2 = new D2();
const wanted = new Set();
let rendered = 0, cached = 0;

for (const b of blocks) {
  const key = keyFor(b.src, b.raw);
  const name = `d2-${key}.svg`;
  const outPath = path.join(OUTDIR, name);
  wanted.add(name);

  try { await fs.access(outPath); cached++; continue; } catch { /* 需要渲染 */ }

  try {
    const r = await d2.compile(b.src.replace(/\r\n/g, '\n').trim(), { layout: b.raw.layout });
    let svg = await d2.render(r.diagram, { ...r.renderOptions, ...renderOptsFrom(b.raw) });
    await fs.writeFile(outPath, addIntrinsicSize(retargetDarkCss(svg)), 'utf8');
    rendered++;
  } catch (err) {
    console.error(`x ${path.relative(ROOT, b.file)} 的 d2 圖渲染失敗：`);
    console.error(String(err && err.message || err).split('\n').slice(0, 6).join('\n'));
    process.exitCode = 1;
  }
}

// 清掉沒人引用的舊圖，免得 assets/diagrams 越積越多
let pruned = 0;
for (const name of await fs.readdir(OUTDIR)) {
  if (name.startsWith('d2-') && name.endsWith('.svg') && !wanted.has(name)) {
    await fs.unlink(path.join(OUTDIR, name)); pruned++;
  }
}

console.log(`d2: 新渲染 ${rendered}、沿用 ${cached}、清除 ${pruned}（共 ${blocks.length} 張）`);
process.exit(process.exitCode || 0);
