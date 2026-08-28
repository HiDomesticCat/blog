+++
title = "技術寫作元件示範"
slug = "tech-rendering-demo"
date = 2026-08-28
draft = true
description = "這個站在技術文章裡可以用的所有排版元件：數學式、圖表、程式碼。"
categories = ["筆記"]
tags = ["寫作", "工具"]
+++

這頁是給我自己看的參考頁，把可以用的元件全列一次。
`draft = true`，不會被發佈。

## 數學式

數學式是**建置期**就用 KaTeX 渲染完成的，訪客端不需要任何 JavaScript，
把瀏覽器的 JS 關掉式子照樣看得到。

行內式子用 `\( \)`：雜湊碰撞的生日界大約在 \(2^{n/2}\) 次查詢，
所以 SHA-256 的碰撞抗性是 \(2^{128}\) 而不是 \(2^{256}\)。

區塊式子用 `$$ $$`：

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

主力是 **D2**（MPL-2.0 開源）。跟 Mermaid 最大的差別是它在**建置期**產生 SVG，
所以訪客端零 JavaScript、沒有 CDN 依賴，關掉 JS 也看得到圖。
深色模式是 SVG 內建的，切換主題會跟著換。

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

{{< d2 caption="TLS 1.3 的一趟往返交握" >}}
shape: sequence_diagram

client: 用戶端
server: 伺服器

client -> server: ClientHello（含金鑰分享）
server -> client: ServerHello（含金鑰分享）
server -> client: EncryptedExtensions
server -> client: Certificate + CertificateVerify
server -> client: Finished
client -> server: Finished
client -> server: 應用資料
{{< /d2 >}}

### 手繪風與另一種佈局

`sketch="true"` 會換成手繪風格，`layout="elk"` 換成另一個佈局引擎
（分層比較整齊，適合階層深的圖）。

{{< d2 sketch="true" layout="elk" caption="實驗室網路分層（手繪風 + ELK 佈局）" >}}
direction: down

net: 校園網路 {
  fw: 防火牆
  mikrotik: MikroTik 路由器
}

lab: OpenStack 叢集 {
  ctrl: 控制節點
  c1: 計算節點 1
  c2: 計算節點 2
  ceph: 儲存
}

net.fw -> net.mikrotik
net.mikrotik -> lab.ctrl
lab.ctrl -> lab.c1
lab.ctrl -> lab.c2
lab.c1 -> lab.ceph
lab.c2 -> lab.ceph
{{< /d2 >}}

### Mermaid（備援）

D2 沒有的圖型才用 Mermaid，例如甘特圖、圓餅圖、mindmap。
用到才會載入那 2.5 MB，其他頁面不受影響。

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

在 code fence 後面加 `{linenos=true, hl_lines=[3-4]}` 就會標出重點：

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

設定寫在 `config.toml` 的 `[markup.highlight]`，
把 `noClasses` 設成 `false` 之後配色才會由主題的 `_syntax.scss` 提供。

## 其他

| 元件 | 語法 | 渲染時機 |
|------|------|----------|
| 數學式 | `\( \)` / `$$ $$` | 建置期 |
| D2 圖表 | `{{%/* d2 */%}}` | 建置期 |
| Mermaid | `{{%/* mermaid */%}}` | 瀏覽器端 |
| 程式碼 | code fence | 建置期 |

有註腳[^1]，也有引言：

> 不被觀測的東西，會安靜地不見。

[^1]: 註腳會自動收到文章最後面，並產生回到原處的連結。
