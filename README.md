# 我的研究筆記（Hugo + hugo-coder）使用與開發教學

本文件說明如何在本機啟動、撰寫內容、維護多語、客製化樣式與部署此部落格。所有相關檔案均位於 /root/workspace/blog 目錄。

- 架構：Hugo（Extended）+ 主題 hugo-coder
- 多語：繁中（/zh）為預設語言子路徑、英文（/en）
- 風格：目前採主題原生風格（未啟用自訂 CSS/JS），確保穩定

目錄大綱：
- 快速開始
- 目錄結構
- 開發模式（本機預覽）
- 多語設定與首頁顯示（/zh 與 /en 文字不同）
- 內容撰寫（文章、頁面、分類/標籤）
  - 圖片（Page Bundle、static/images、figure 短代碼）
  - 程式碼與語法標示（fenced code、highlight 短代碼、行號/高亮）
  - 數學公式（KaTeX 啟用與分隔符）
  - Mermaid 圖表/流程圖
- 靜態資源與 Hugo 資產管線（assets 與 static）
- 自訂樣式與腳本（如何啟用/停用）
- 部署（產生 public/ 並上傳）
- 清理與版本控制
- 常見問題（FAQ）
- 變更紀錄摘要（此次優化項）
- 範例：一篇完整含圖片/程式碼/公式/流程圖的文章

---

## 1. 快速開始

1) 安裝 Hugo Extended（建議 v0.131.0 或更新）
- Linux/macOS：可使用官方文件或套件管理器安裝
- 驗證
  ```
  hugo version
  # 例：hugo v0.131.0+extended ...
  ```

2) 切換到專案目錄
```
cd /root/workspace/blog
```

3) 本機啟動開發伺服器
```
hugo server --bind 0.0.0.0 --port 1313

rm -rf docs public && hugo --minify --baseURL "https://HiDomesticCat.github.io/blog/"
mkdir -p docs && cp -r public/* docs/ || true
git add .
git commit -m "Recreate docs from fresh Hugo build [skip ci]" || echo "No changes to commit"
git push --force origin main

hugo server --bind 0.0.0.0 --port 1313 --baseURL http://192.168.10.13:1313
```
- 於瀏覽器開啟：http://localhost:1313/
- 預設語言路徑：/zh/（繁體中文）、/en/（English）
- 若在遠端環境，請依實際主機 IP/網域替換

---

## 2. 目錄結構（重點）

```
blog/
├─ config.toml                 # Hugo 主設定（多語、選單、主題參數）
├─ content/
│  ├─ zh/                      # 繁中內容（首頁：content/zh/_index.md）
│  └─ en/                      # 英文內容（首頁：content/en/_index.md）
├─ layouts/                    # 自訂模板（必要時覆寫主題模板）
├─ static/
│  ├─ index.html               # 根路徑 / 的靜態頁（目前導向 /zh/）
│  ├─ css/custom.css           # 備用自訂樣式（未啟用）
│  └─ js/custom.js             # 備用自訂腳本（未啟用）
├─ assets/
│  ├─ css/custom.css           # 資產管線版本（未啟用）
│  └─ js/custom.js             # 資產管線版本（未啟用）
├─ themes/hugo-coder/          # 主題
├─ .gitignore                  # 忽略 public/、resources/、.hugo_build.lock
└─ （build 輸出）public/、resources/（不進版控）
```

---

## 3. 開發模式（本機預覽）

- 啟動
  ```
  cd /root/workspace/blog
  hugo server --bind 0.0.0.0 --port 1313
  ```
- 停用 Fast Render（完整重建）
  ```
  hugo server --disableFastRender
  ```
- 預覽路徑
  - 繁中首頁：http://localhost:1313/zh/
  - 英文首頁：http://localhost:1313/en/

注意：根路徑 `/` 目前由 `static/index.html` 轉址到 `/zh/`。

---

## 4. 多語設定與首頁顯示

- `config.toml` 已啟用：
  ```toml
  defaultContentLanguage = "zh"
  defaultContentLanguageInSubdir = true
  ```
  代表預設語言為繁中，並強制語言子路徑（/zh、/en）。

- 首頁內容檔：
  - 繁中首頁：`content/zh/_index.md`
  - 英文首頁：`content/en/_index.md`
  兩者可分別填寫不同的 `title` 或內容，使 /zh 與 /en 顯示不同文字。

- 首頁顯示來源（hugo-coder）
  - 使用主題 `layouts/index.html`（呼叫 `partials/home.html`）
  - `partials/home/author.html` 會讀 `.Site.Params.author`、`.Site.Params.info`
  - 已於 `config.toml` 設定語言專屬參數：
    ```toml
    [languages.zh.params]
      author = "技術研究者"
      info = ["資訊安全研究員","無線通訊專家","量子計算愛好者","雲端架構師"]

    [languages.en.params]
      author = "Tech Researcher"
      info = ["Information Security Researcher","Wireless Communications Expert","Quantum Computing Enthusiast","Cloud Architect"]
    ```
  因此 /zh 與 /en 首頁將顯示不同文字。

- 選單（Menu）也採多語段落：
  ```toml
  [[languages.zh.menu.main]]
  [[languages.en.menu.main]]
  ```
  各自維護。

---

## 5. 內容撰寫

- 新增文章（以繁中為例）
  ```
  hugo new zh/posts/my-article.md
  ```
  英文：
  ```
  hugo new en/posts/my-article.md
  ```

- Front Matter（YAML/TOML/JSON 皆可）
  範例（TOML）：
  ```toml
  +++
  title = "標題"
  date = "2025-08-24"
  description = "文章摘要"
  slug = "my-article"
  tags = ["tag1","tag2"]
  categories = ["分類"]
  +++
  文章內文...
  ```

- 清單頁（Section）標題
  - `content/zh/posts/_index.md`、`content/en/posts/_index.md` 用於設定 posts 清單頁屬性

### 5.1 圖片（3 種方式）

1) 放在 `static/images/`（全站共用）
- 檔案路徑：`static/images/diagram.png`
- Markdown 引用：
  ```md
  ![圖示說明](/images/diagram.png "可選的標題")
  ```
- 優點：簡單、直觀；中英文皆可共用同張圖  
- 注意：以 `/` 開頭（網站根目錄）

2) Page Bundle（與文章同資料夾）
- 目錄型文章：
  ```
  content/zh/posts/my-article/index.md
  content/zh/posts/my-article/figure1.png
  ```
- 引用（相對路徑）：
  ```md
  ![說明](figure1.png)
  ```
- 也可用 `figure` 短代碼（可加標題/來源）：
  ```md
  {{< figure src="figure1.png" title="圖 1：系統架構" alt="系統架構示意圖" >}}
  ```

3) HTML 更細控制（寬度/樣式）
```html
<img src="/images/diagram.png" alt="示意圖" style="max-width: 600px; width: 100%;" />
```

建議：多語內容若需不同圖，可各語言各自 Page Bundle；若共用，放在 `static/images/`。

### 5.2 程式碼與語法標示

- 首選：圍欄語法（fenced code blocks），指定語言：
  ````
  ```go
  package main

  import "fmt"

  func main() {
      fmt.Println("Hello, Hugo")
  }
  ```
  ````
- 進階：`highlight` 短代碼（可行號/高亮）：
  ```md
  {{< highlight python "linenos=table,hl_lines=2-3,linenostart=1" >}}
  def add(a, b):
      return a + b
  print(add(2, 3))
  {{< /highlight >}}
  ```
  參數示例：
  - `linenos=true` 或 `linenos=table`：顯示行號
  - `hl_lines=2-3`：高亮第 2–3 行
  - `linenostart=1`：行號起始值

提示：若想直接在 fenced code 使用行高亮等屬性，需另外啟用 Goldmark attributes；目前未開啟，建議用 `highlight` 短代碼。

### 5.3 數學公式（KaTeX）

主題在 `partials/posts/math.html` 已整合 KaTeX。啟用方式（二擇一或皆可）：

- 全站啟用（`config.toml`）：
  ```toml
  [params]
    math = true
  # 或
  # katex = true
  ```
- 單篇啟用（Front Matter）：
  ```toml
  +++
  title = "含數學的文章"
  date = "2025-08-24"
  math = true
  +++
  ```

可用分隔符：
- 行內：`$ a^2 + b^2 = c^2 $` 或 `\( a^2 + b^2 = c^2 \)`
- 區塊：`$$ E = mc^2 $$` 或 `\[ E = mc^2 \]`

範例：
```md
行內：在直角三角形中，$a^2 + b^2 = c^2$。

區塊：
$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$
```

注意：
- Markdown 內底線 `_`、反斜線 `\` 等可能需跳脫
- 若未渲染，檢查本文或全站是否已啟用 `math=true`/`katex=true`

### 5.4 Mermaid 圖表/流程圖

主題支援 `mermaid` 短代碼（首頁模板會自動載入腳本，當檢測到該短代碼）。

範例：
```md
{{< mermaid >}}
graph TD
  A[開始] --> B{條件?}
  B -- 是 --> C[流程 1]
  B -- 否 --> D[流程 2]
{{< /mermaid >}}
```

---

## 6. 靜態資源與資產管線

- `static/` 內檔案：原樣發佈到網站根目錄（不經管線處理）
- `assets/` 內檔案：可由 Hugo 管線處理（minify/fingerprint 等）
- 主題 hugo-coder 的 `head/custom-styles.html`、`baseof.html` 對 `.Site.Params.customCSS/customJS` 使用 `resources.Get`，因此若啟用自訂資源，請將檔案放在 `assets/`（而非 `static/`）

---

## 7. 自訂樣式與腳本（如何啟用/停用）

- 目前為保留主題原生風格，`config.toml` 已停用：
  ```toml
  # customCSS = ["css/custom.css"]
  # customJS  = ["js/custom.js"]
  ```
- 若要啟用：
  1) 確保檔案存在於：
     ```
     assets/css/custom.css
     assets/js/custom.js
     ```
  2) 於 `config.toml` 啟用
     ```toml
     [params]
       customCSS = ["css/custom.css"]
       customJS  = ["js/custom.js"]
     ```
  3) 重新啟動 `hugo server`
- 注意：若路徑指向 `static/` 檔案，主題的 `resources.Get` 會找不到，導致「nil pointer evaluating resource.Resource.RelPermalink」錯誤。請放在 `assets/`。

- Avatar 與 OG 圖片
  - 目前為避免 404，已註解：
    ```toml
    # avatarURL = "images/avatar.jpg"
    # images = ["images/og-image.png"]
    ```
  - 若要啟用，請先放入：
    ```
    static/images/avatar.jpg
    static/images/og-image.png
    ```
    然後取消註解。

---

## 8. 部署（產生 Public 靜態檔案）

- 產生產出（預設輸出至 `public/`）
  ```
  cd /root/workspace/blog
  hugo --minify
  ```
- 將 `public/` 上傳至靜態網站主機（GitHub Pages、Netlify、雲主機 Nginx 等）
- 如採 CI/CD，請勿將 `public/` 納入版控，本專案 `.gitignore` 已忽略

---

## 9. 清理與版本控制

- 清除產物：
  ```
  rm -rf public resources .hugo_build.lock
  ```
- `.gitignore`（位於 blog/）已忽略：
  ```
  public/
  resources/
  .hugo_build.lock
  ```

---

## 10. 常見問題（FAQ）

1) 啟用 customCSS/customJS 後出現 `$styles.RelPermalink` nil 錯誤  
   - 原因：主題以 `resources.Get` 載入，需要檔案位於 `assets/`  
   - 解法：將 `css/custom.css`、`js/custom.js` 放到 `assets/`，並於 `config.toml` 啟用。

2) 首頁多語文字相同  
   - 檢查 `config.toml` 的 `[languages.zh.params]` 與 `[languages.en.params]` 是否已設定不同值  
   - 也可直接在 `content/zh/_index.md`、`content/en/_index.md` 寫入不同內容。

3) 根路徑 `/` 顯示行為  
   - 目前 `static/index.html` 會導向 `/zh/`  
   - 若欲改為語言選擇頁，可替換該檔案內容為自訂選擇頁（或移除並採伺服器層導向）。

4) WARN: found no layout file for "json" for kind "home"  
   - 問題來源：`[outputs] home = ["HTML","RSS","JSON"]` 但主題未提供對應 JSON 模板  
   - 解法：可忽略、或在 `layouts/` 提供自訂 JSON 模板、或移除 `JSON` 輸出類型。

---

## 11. 變更紀錄摘要（此次優化）

- 清除測試/樣張與建置產物：
  - 刪除樣張 `content/en/posts/welcome.md`
  - 刪除主題 exampleSite（避免引入大量範例內容）
  - 刪除 `public/`、`resources/`、`.hugo_build.lock`；新增 `.gitignore`
- 維持主題原生風格、避免缺檔：
  - 停用自訂 CSS/JS（已保留 assets 對應檔，隨時可啟用）
  - 註解 avatar 與 og-image 設定（待檔案就緒再啟用）
- 多語設定：
  - 啟用 `defaultContentLanguageInSubdir = true`（/zh、/en）
  - 對 zh/en 設定不同的 `[languages.xx.params]`，使首頁文字不同
  - `static/index.html` 目前將根路徑導向 `/zh/`

---

## 12. 範例：完整含圖片/程式碼/公式/流程圖的文章

以繁中為例，建立 Page Bundle 型文章：

```
content/zh/posts/demo/index.md
content/zh/posts/demo/arch.png
```

`index.md` 內容參考：
```toml
+++
title = "Demo：圖片、程式碼、公式與流程圖"
date = "2025-08-24"
description = "示範 Hugo 文章常見元素"
slug = "demo-all-in-one"
tags = ["demo","hugo","mermaid","math","code"]
categories = ["教學"]
math = true
+++
```

接著撰寫 Markdown 內容：
```md
## 圖片（Page Bundle）
{{< figure src="arch.png" title="系統架構圖" alt="Arch" >}}

## 程式碼（Go）
{{< highlight go "linenos=table,hl_lines=4-6" >}}
package main

import "fmt"

func main() {
    fmt.Println("Demo")
}
{{< /highlight >}}

## 數學公式
行內：$a^2 + b^2 = c^2$

區塊：
$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

## Mermaid
{{< mermaid >}}
sequenceDiagram
  participant U as User
  participant H as Hugo
  U->>H: Write content
  H-->>U: Build site
{{< /mermaid >}}
```

英文可於 `content/en/posts/demo/index.md` 撰寫對應內容；圖片共用可放 `static/images/`，或各語系分別維護 Page Bundle。

---

## 13. 推薦工作流程

- 本機編輯 + 預覽（`hugo server`）
- 內容完成後使用 `hugo --minify` 產出
- 將 `public/` 發佈到靜態主機
- 需要自訂風格時，再啟用 `customCSS/customJS`，並確保資源放在 `assets/` 目錄

---

有任何需求（如語言選擇首頁、特定區塊翻譯、版面微調），可在 `layouts/` 建立對應模板覆寫主題，或於 `config.toml` / `content` 層級進行設定與內容差異化。
