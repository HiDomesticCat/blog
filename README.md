# hicat0x0 blog

于京平（hicat0x0）的技術部落格原始碼。
線上網址：**<https://blog.hicat0x0.uk>**

| 項目 | 內容 |
|------|------|
| 靜態網站產生器 | Hugo **Extended** 0.145.0（CI 固定版本） |
| 主題 | [hugo-coder](https://github.com/luizdepra/hugo-coder)，直接放在 `themes/`（非 submodule） |
| 語言 | 繁體中文 `/zh/`（預設）、English `/en/` |
| 部署 | push 到 `main` → GitHub Actions 建置 → 提交 `docs/` → GitHub Pages |
| 自訂網域 | `static/CNAME` → `blog.hicat0x0.uk` |

---

## 目錄

- [快速開始](#快速開始)
- [目錄結構](#目錄結構)
- [撰寫內容](#撰寫內容)
- [多語言](#多語言)
- [自訂樣式與腳本](#自訂樣式與腳本)
- [目錄（TOC）](#目錄toc)
- [模板覆寫](#模板覆寫)
- [部署流程](#部署流程)
- [常見問題](#常見問題)

---

## 快速開始

### 1. 安裝 Hugo Extended

必須是 **Extended** 版本（主題用 SCSS，一般版會建置失敗）。
建議與 CI 對齊到 **0.145.0**。

```bash
hugo version
# 應包含 "+extended"，例：hugo v0.145.0+extended
```

若手邊沒有套件管理器，也可以用 npm 取得同版本的二進位檔：

```bash
npm install hugo-extended@0.145.0
```

### 2. 取得原始碼

主題已經 vendored 在 `themes/hugo-coder`，`git clone` 之後不需要再 `submodule update`。

```bash
git clone https://github.com/HiDomesticCat/blog.git
cd blog
```

### 3. 本機預覽

```bash
./build-and-deploy.sh serve
```

- 繁中：<http://localhost:1313/zh/>
- 英文：<http://localhost:1313/en/>
- 根路徑 `/` 由 `static/index.html` 轉址到 `/zh/`

要用與 CI 相同的參數做一次完整建置檢查：

```bash
./build-and-deploy.sh build
```

> 這支腳本**不會**動 git、也不會寫 `docs/`。部署是 CI 的工作，見下方[部署流程](#部署流程)。

---

## 目錄結構

```
blog/
├─ config.toml                    # 全站設定（多語、選單、主題參數）
├─ content/
│  ├─ zh/                         # 繁中內容
│  │  ├─ _index.md                #   首頁 front matter（內容不會顯示，見下方說明）
│  │  ├─ about.md / projects.md / contact.md
│  │  └─ posts/                   #   文章
│  └─ en/                         # 英文內容（結構同上）
├─ layouts/                       # 覆寫主題模板（只放有改的檔案）
│  ├─ 404.html                    #   404 頁：自動嘗試另一語系
│  ├─ _default/single.html
│  ├─ posts/single.html           #   文章頁（已接上 TOC）
│  └─ partials/
│     ├─ head.html                #   複製自主題 + 加上 hreflang
│     ├─ page.html                #   一般頁面（已接上 TOC）
│     └─ toc.html                 #   目錄，主題本身沒有
├─ i18n/                          # 專案層級翻譯字串（與主題的 i18n 合併）
│  ├─ zh.toml
│  └─ en.toml
├─ assets/                        # ★ 走 Hugo 資產管線（會被 minify + fingerprint）
│  ├─ css/custom.css              #   自訂樣式（實際生效的就是這份）
│  ├─ js/custom.js                #   自訂腳本
│  └─ js/coder.js                 #   覆寫主題的 coder.js，修深淺色切換
├─ static/                        # 原樣複製到網站根目錄
│  ├─ CNAME                       #   自訂網域
│  ├─ index.html                  #   / → /zh/ 轉址頁
│  └─ images/hicat0x0.png         #   頭像
├─ themes/hugo-coder/             # 主題（vendored）
├─ docs/                          # ★ 建置產物，由 CI 自動提交，不要手改
└─ .github/workflows/deploy.yml   # 建置與部署
```

### `assets/` 與 `static/` 的差別（重要）

| 目錄 | 處理方式 | 用途 |
|------|----------|------|
| `assets/` | 經 Hugo 資產管線（`resources.Get` → minify → fingerprint） | 自訂 CSS/JS |
| `static/` | 原樣複製，不處理 | CNAME、圖片、轉址頁 |

hugo-coder 是用 **`resources.Get`** 讀 `customCSS` / `customJS` 的，
**只會在 `assets/` 底下找**。放到 `static/` 不但不會生效，還會被原樣發佈成沒人引用的死檔案。

---

## 撰寫內容

### 新增文章

```bash
hugo new zh/posts/my-article.md
```

Front matter 範例：

```toml
+++
title = "文章標題"
date = 2026-08-23
slug = "my-article"            # ★ 一定要寫，理由見下
description = "給搜尋引擎與社群分享卡片看的摘要"
tags = ["tag1", "tag2"]
categories = ["技術"]
# toc = false                  # 單篇關閉目錄（預設吃全站設定）
# draft = true                 # 草稿不會發佈
+++
```

> **`slug` 一定要寫。**
> 網址規則是 `permalinks.posts = "/posts/:slug/"`。沒有 `slug` 時 Hugo 會拿中文標題去組網址，
> 產生像 `/zh/posts/在-android-上使用-rtl-sdr-v4完整入門與進階教學/` 這種百分號編碼、
> 不利於分享與 SEO 的路徑。
>
> 如果要改既有文章的 `slug`，記得用 `aliases` 保留舊網址：
>
> ```toml
> aliases = ["/zh/posts/舊的網址/"]
> ```
>
> `aliases` 需要含語言前綴（`/zh/...`），否則產生的轉址頁會落在網站根目錄。

### 標題層級

正文請用 Markdown 的 `##` / `###`，不要用純文字當小標。
標題會決定目錄、錨點與 SEO 結構。

### 圖片

1. 全站共用：放 `static/images/`，用 `![說明](/images/foo.png)` 引用
2. Page Bundle：`content/zh/posts/my-article/index.md` + 同資料夾圖片，用 `![說明](foo.png)`
3. 需要控制寬度時可直接寫 HTML（`markup.goldmark.renderer.unsafe = true` 已開啟）

### 程式碼

用圍欄語法並標明語言：

````markdown
```bash
rtl_tcp -a 0.0.0.0 -p 1234
```
````

配色來自主題的 `_syntax.scss`（`markup.highlight.noClasses = false`，
所以 Chroma 輸出的是 CSS class，設 `style` 不會有效果）。

### 數學與圖表

- **KaTeX**：`config.toml` 加 `math = true`，或單篇 front matter 加 `math = true`
- **Mermaid**：用 `{{< mermaid >}}` 短代碼，主題會自動載入腳本

---

## 多語言

```toml
defaultContentLanguage         = "zh"
defaultContentLanguageInSubdir = true
```

- 兩種語言都帶前綴：`/zh/`、`/en/`
- 每個語言各自維護 `[languages.xx.params]`（作者、描述、關鍵字、首頁 info 列表）與 `[[languages.xx.menu.main]]`
- 同名檔案（例如 `content/zh/about.md` 與 `content/en/about.md`）會自動被視為互為翻譯，
  `layouts/partials/head.html` 會據此輸出 `hreflang` 給搜尋引擎

### 首頁的內容不會顯示

hugo-coder 的首頁（`partials/home.html`）只渲染頭像、作者、`params.info` 清單與社群圖示，
**不會渲染 `content/xx/_index.md` 的內文**。
`_index.md` 的 `title` 與 `description` 仍會影響 `og:title` / `og:description`，所以還是要寫。

要改首頁那幾行字，是改 `config.toml` 的 `[languages.xx.params].info`。

---

## 自訂樣式與腳本

```toml
[params]
  customCSS = ["css/custom.css"]   # → assets/css/custom.css
  customJS  = ["js/custom.js"]     # → assets/js/custom.js
```

`assets/js/custom.js` 目前提供：回到頂部按鈕、閱讀進度條、程式碼複製按鈕、
外部連結開新分頁、深色模式切換動畫、目錄捲動高亮、錨點平滑捲動。

`assets/js/coder.js` **覆寫**了主題同名檔案，差別是：

- 用 `addEventListener('change', …)` 取代已棄用的 `addListener`
- 只有在使用者沒手動選過主題時才跟隨系統深淺色（原本會蓋掉使用者的選擇）

> 主題升級時要記得比對 `themes/hugo-coder/assets/js/coder.js` 是否有變動，
> 這是整份覆寫，不是 patch。

---

## 目錄（TOC）

hugo-coder 沒有目錄功能，這裡自己補了 `layouts/partials/toc.html`。

```toml
[params]
  enableToc      = true   # 全站開關
  tocMinHeadings = 3      # 標題少於這個數量就不顯示

[markup.tableOfContents]
  startLevel = 2          # 從 ## 開始
  endLevel   = 4          # 到 #### 為止
```

單篇要關掉就在 front matter 寫 `toc = false`。

樣式在 `assets/css/custom.css` 的 `.toc` / `#TableOfContents` 區塊，
捲動高亮在 `assets/js/custom.js`。

---

## 模板覆寫

`layouts/` 底下只放**有修改**的檔案，其餘沿用主題。目前覆寫了：

| 檔案 | 為什麼 |
|------|--------|
| `partials/head.html` | 複製自主題，額外輸出 `hreflang` 多語連結 |
| `partials/page.html` | 一般頁面加上目錄 |
| `partials/toc.html` | 新增，主題沒有目錄功能 |
| `posts/single.html` | 文章頁加上目錄 |
| `_default/single.html` | 統一標題格式 |
| `404.html` | 找不到頁面時自動試另一個語系 |

升級主題後請檢查 `partials/head.html`，那是整份複製的。

---

## 部署流程

```
push 到 main
   └─> .github/workflows/deploy.yml
         ├─ 安裝 Hugo Extended 0.145.0
         ├─ hugo --minify --gc --baseURL https://blog.hicat0x0.uk/
         ├─ 驗證 public/ 有 index.html、zh、en、CNAME
         └─ 複製 public/ → docs/、加 .nojekyll、commit 並 push
               └─> GitHub Pages 從 main 分支的 docs/ 提供服務
```

- 部署 commit 帶 `[skip ci]`，不會觸發第二輪建置
- `concurrency: deploy-pages` 確保同時只跑一個部署，避免兩次 push 打架
- **`docs/` 不要手動編輯**，下一次 CI 會整個覆蓋掉
- 也可以在 GitHub 的 Actions 頁面用 `workflow_dispatch` 手動觸發

### GitHub Pages 設定

Settings → Pages → Source = `Deploy from a branch`，
Branch = `main`，資料夾 = `/docs`，Custom domain = `blog.hicat0x0.uk`。

---

## 常見問題

**啟用 `customCSS` / `customJS` 後出現 `nil pointer evaluating resource.Resource.RelPermalink`**

檔案放錯位置了。主題用 `resources.Get` 載入，必須放在 `assets/`，不是 `static/`。

**改了 `static/css/custom.css` 卻沒有任何變化**

那個路徑不會被引用。實際生效的是 `assets/css/custom.css`。
（這兩份重複檔案已在 2026-08 移除。）

**中文文章網址是一長串百分號編碼**

front matter 少了 `slug`。補上後記得加 `aliases` 保留舊網址。

**首頁改了 `_index.md` 沒反應**

首頁不渲染 `_index.md` 內文，見[多語言](#多語言)一節。

**`WARN found no layout file for "json" for kind "home"`**

`[outputs] home` 曾包含 `JSON`，但主題沒有對應模板。已改成 `["HTML", "RSS"]`。

**建置失敗，說 SCSS 相關錯誤**

裝到非 Extended 版的 Hugo 了。`hugo version` 要看到 `+extended`。
