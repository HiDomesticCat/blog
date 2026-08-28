+++
title = "技術寫作元件"
slug = "tech-rendering-demo"
date = 2026-08-28
description = "這個站在技術文章裡可以用的所有元件：數學式、圖表、程式碼，以及做不到的事。"
categories = ["筆記"]
tags = ["寫作", "工具"]
+++

這個站在技術文章裡可以用的元件，全部列在這裡，也記下**做不到的事**[^1]。
每一項都是實際渲染出來的，不是截圖 —— 圖可以點右上角放大，程式碼可以複製，
文字都選得起來。寫新文章時我自己也會回來翻這頁。

## 數學式

**建置期**就用 KaTeX 渲染完成，訪客端不需要 JavaScript，關掉 JS 也看得到。
不用在 front matter 寫 `math = true`。

行內用 `\( \)`：雜湊碰撞的生日界大約在 \(2^{n/2}\) 次查詢，
所以 SHA-256 的碰撞抗性是 \(2^{128}\) 而不是 \(2^{256}\)。

區塊用 `$$ $$`：

$$
P(\text{碰撞}) \approx 1 - e^{-\frac{k(k-1)}{2N}}
$$

多行對齊：

$$
\begin{aligned}
c &= E_k(m) \oplus r \
  &= (m \cdot k \bmod p) \oplus r
\end{aligned}
$$

矩陣與大型運算子：

$$
H = \sum_{i=1}^{n} \begin{bmatrix} a_i & b_i \ c_i & d_i \end{bmatrix}
\quad\text{其中}\quad \int_{0}^{\infty} e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}
$$

> **為什麼行內不用 `$ $`**
> 開了之後「這台設備要價 $50000 到 $60000 台幣」裡的 `$50000 到 $`
> 會被當成一條行內數學式吃掉。價格在技術文章裡太常見，所以行內一律用 `\( \)`。
> 行內程式碼與程式碼區塊裡的 `$` 不受影響。

## 圖表

主力是 **D2**（MPL-2.0）。跟 Mermaid 最大的差別是它在**建置期**產生 SVG，
所以訪客端零 JavaScript、沒有 CDN 依賴，關掉 JS 也看得到圖。
深色是 SVG 內建的，切換主題會跟著換。

### 流程圖

{{< d2 caption="一次典型的 SSRF 打到雲端中繼資料服務" >}}
direction: right

attacker: 攻擊者 { shape: person }
app: 應用程式伺服器
imds: 中繼資料服務\n169.254.169.254 { shape: hexagon }
s3: 物件儲存

attacker -> app: 帶內部網址的請求
app -> imds: 伺服器代為請求
imds -> app: 臨時憑證
app -> attacker: 回應內含憑證
attacker -> s3: 用憑證直接存取 {
  style.stroke-dash: 3
  style.stroke: "#c2410c"
}
{{< /d2 >}}

### 循序圖

{{< d2 caption="OAuth 2.0 授權碼流程" >}}
shape: sequence_diagram

user: 使用者
app: 用戶端應用
idp: 授權伺服器
api: 資源伺服器

user -> app: 點擊登入
app -> idp: 導向授權端點
idp -> user: 顯示同意畫面
user -> idp: 同意
idp -> app: 回傳授權碼
app -> idp: 用授權碼換 token
idp -> app: access_token
app -> api: 帶 token 呼叫
api -> app: 資料
{{< /d2 >}}

### 類別圖

{{< d2 caption="UML 類別，支援存取修飾與型別" >}}
direction: right

Cipher: {
  shape: class
  -key: bytes
  -nonce: bytes
  +encrypt(pt bytes): bytes
  +decrypt(ct bytes): bytes
}

AEAD: {
  shape: class
  +seal(pt bytes, ad bytes): bytes
  +open(ct bytes, ad bytes): bytes
}

Cipher -> AEAD: 實作
{{< /d2 >}}

### ER 圖 / 資料表

{{< d2 caption="sql_table 形狀，支援主鍵與外鍵標記" >}}
direction: right

users: {
  shape: sql_table
  id: int {constraint: primary_key}
  email: varchar(255)
  created_at: timestamp
}

sessions: {
  shape: sql_table
  id: uuid {constraint: primary_key}
  user_id: int {constraint: foreign_key}
  expires_at: timestamp
}

audit: {
  shape: sql_table
  id: bigint {constraint: primary_key}
  user_id: int {constraint: foreign_key}
  action: varchar(64)
}

sessions.user_id -> users.id: 多對一
audit.user_id -> users.id: 多對一
{{< /d2 >}}

### 狀態機

D2 沒有專用的狀態機語法，用一般有向圖表達，效果一樣。

{{< d2 caption="TCP 連線狀態（節錄）" >}}
direction: right
CLOSED -> LISTEN: passive open
LISTEN -> SYN_RCVD: 收到 SYN
SYN_RCVD -> ESTABLISHED: 收到 ACK
ESTABLISHED -> FIN_WAIT_1: 主動關閉
FIN_WAIT_1 -> TIME_WAIT: 收到 FIN+ACK
TIME_WAIT -> CLOSED: 2MSL 逾時
{{< /d2 >}}

### 巢狀容器 / 網路架構

`layout="elk"` 換成另一個佈局引擎，階層深的圖會比較整齊。

{{< d2 layout="elk" caption="容器可以無限巢狀，連線能跨層" >}}
direction: down

internet: 網際網路 {shape: cloud}

edge: 邊界 {
  fw: 防火牆
  lb: 負載平衡
  fw -> lb
}

app: 應用層 {
  web1: Web 1
  web2: Web 2
}

data: 資料層 {
  pg: PostgreSQL {shape: cylinder}
  redis: Redis {shape: cylinder}
}

internet -> edge.fw
edge.lb -> app.web1
edge.lb -> app.web2
app.web1 -> data.pg
app.web2 -> data.pg
app.web1 -> data.redis
{{< /d2 >}}

### 網格佈局

{{< d2 caption="grid 用來排比較表、矩陣這類非流程內容" >}}
grid-rows: 3
grid-columns: 3

機密性; 完整性; 可用性
加密; 雜湊; 備援
TLS; HMAC; 叢集
{{< /d2 >}}

### 形狀庫

{{< d2 layout="elk" caption="內建形狀，畫架構圖時夠用" >}}
grid-columns: 5

a: person {shape: person}
b: cylinder {shape: cylinder}
c: queue {shape: queue}
d: package {shape: package}
e: document {shape: document}
f: step {shape: step}
g: hexagon {shape: hexagon}
h: oval {shape: oval}
i: cloud {shape: cloud}
j: diamond {shape: diamond}
k: stored_data {shape: stored_data}
l: parallelogram {shape: parallelogram}
m: circle {shape: circle}
n: callout {shape: callout}
o: page {shape: page}
{{< /d2 >}}

### 樣式與強調

{{< d2 caption="classes 定義可重複使用的樣式" >}}
direction: right

classes: {
  危險: {
    style: {fill: "#fee2e2"; stroke: "#dc2626"; stroke-width: 2}
  }
  安全: {
    style: {fill: "#dcfce7"; stroke: "#16a34a"}
  }
}

輸入 -> 未驗證的反序列化 {class: 危險}
未驗證的反序列化 -> 遠端執行 {class: 危險}
輸入 -> 白名單型別檢查 {class: 安全}
白名單型別檢查 -> 安全處理 {class: 安全}
{{< /d2 >}}

### 連線樣式

{{< d2 caption="虛線、粗細、顏色、雙向、箭頭端點" >}}
direction: right
a -> b: 實線
c -> d: 虛線 {style.stroke-dash: 4}
e -> f: 粗線 {style.stroke-width: 4}
g <-> h: 雙向
i -- j: 無方向
k -> l: 菱形端點 {source-arrowhead.shape: diamond; target-arrowhead.shape: triangle}
{{< /d2 >}}

### 圖形內嵌 Markdown

{{< d2 caption="節點裡可以放 Markdown（清單、標題、粗體）" >}}
direction: right

說明: |md
  ### 檢查順序
  1. 驗證來源 IP
  2. 比對簽章
  3. 檢查時間戳
|

結果: 通過才處理

說明 -> 結果
{{< /d2 >}}

### 手繪風

{{< d2 sketch="true" caption="sketch=\"true\"，適合草圖與示意" >}}
direction: right
想法 -> 原型 -> 實驗 -> 論文
實驗 -> 想法: 不如預期
{{< /d2 >}}

### Mermaid（備援）

D2 沒有的圖型才用 Mermaid。用到才會載入那 2.5 MB，其他頁面不受影響。

{{< mermaid caption="專題時程" >}}
gantt
    dateFormat YYYY-MM-DD
    axisFormat %m/%d
    title 研究時程
    section 前期
    文獻回顧        :done,    a1, 2026-09-01, 30d
    環境建置        :active,  a2, 2026-09-20, 20d
    section 實作
    原型開發        :         a3, after a2, 45d
    實驗與量測      :         a4, after a3, 30d
{{< /mermaid >}}

### D2 做不到的

實測過的限制，寫下來免得下次再試一遍：

| 項目 | 狀況 | 怎麼辦 |
|------|------|--------|
| 甘特圖 | 沒有這個語法，`gantt` 只會被當成節點名稱 | 用 Mermaid |
| 圓餅圖 / 長條圖 | 同上 | 用 Mermaid，或直接用表格 |
| mindmap | 同上 | 用一般樹狀圖近似 |
| `\|latex` 區塊 | **直接 panic**，會讓建置失敗 | 數學式寫在圖外面 |
| `\|go` 等程式碼區塊 | 文字會超出方框 13–24px | 改用 `\|md` 或放圖外 |
| `icon:` 指向外部網址 | 網址會寫進 SVG，訪客瀏覽器會去抓 | 用本地檔案 |

## 程式碼

### 一般區塊

```python
import hashlib, hmac

def verify(secret: bytes, payload: bytes, signature: str) -> bool:
    """用固定時間比較，避免以時間差推回簽章。"""
    expected = hmac.new(secret, payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
```

### 行號與標記重點行

在 code fence 後面加 `{linenos=true, hl_lines=[3-4]}`：

```go {linenos=true, hl_lines=[3-4]}
func handler(w http.ResponseWriter, r *http.Request) {
    name := r.URL.Query().Get("name")
    // 這兩行是問題所在：使用者輸入直接進了 HTML
    fmt.Fprintf(w, "<h1>Hello %s</h1>", name)
    w.WriteHeader(http.StatusOK)
}
```

### 很長的行

超出版面時只有程式碼區塊自己橫向捲動，整頁不會跑版：

```bash
openstack server create --flavor m1.large --image ubuntu-24.04 --network lab-net --security-group default --key-name gamma4-lab-key --availability-zone nova my-instance
```

### 行內程式碼

設定在 `config.toml` 的 `[markup.highlight]`，
`noClasses` 要是 `false` 配色才會由主題的 `_syntax.scss` 提供。
等寬字是自帶的 JetBrains Mono。

## 其他

| 元件 | 語法 | 渲染時機 |
|------|------|----------|
| 數學式 | `\( \)` / `$$ $$` | 建置期 |
| D2 圖表 | `{{%/* d2 */%}}` | 建置期 |
| Mermaid | `{{%/* mermaid */%}}` | 瀏覽器端 |
| 程式碼 | code fence | 建置期 |

引言：

> 不被觀測的東西，會安靜地不見。

[^1]: 註腳會自動收到文章最後面。引用點刻意放在文章開頭 ——
    來源與註腳離得近的話，點下去畫面幾乎不動，看不出到底跳了沒。
    跳到之後那一條會短暫亮起，回去的箭頭也一樣。
