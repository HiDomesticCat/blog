+++
title = "Technical Writing Components"
slug = "tech-rendering-demo"
date = 2026-08-28
draft = true
description = "Every component available for technical posts on this site: maths, diagrams and code."
categories = ["Notes"]
tags = ["writing", "tooling"]
+++

A reference page listing every component I can use in a technical post.
It is `draft = true`, so it never gets published.

## Mathematics

Formulas are rendered **at build time** with KaTeX. No JavaScript is needed in the
browser — turn JS off and the formulas are still there.

Inline maths uses `\( \)`: the birthday bound puts a collision at roughly
\(2^{n/2}\) queries, which is why SHA-256 offers \(2^{128}\) collision
resistance rather than \(2^{256}\).

Block maths uses `$$ $$`:

$$
P(\text{collision}) \approx 1 - e^{-\frac{k(k-1)}{2N}}
$$

Aligned equations:

$$
\begin{aligned}
c &= E_k(m) \oplus r \
  &= (m \cdot k \bmod p) \oplus r
\end{aligned}
$$

Matrices and large operators:

$$
H = \sum_{i=1}^{n} \begin{bmatrix} a_i & b_i \ c_i & d_i \end{bmatrix}
\quad\text{where}\quad \int_{0}^{\infty} e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}
$$

> **Why inline maths does not use `$ $`**
> With single dollars enabled, a sentence like "the rig costs $50000 to $60000"
> has `$50000 to $` swallowed as an inline formula. Prices are common in technical
> writing, so inline maths always uses `\( \)`. Dollars inside inline code and
> fenced code blocks are unaffected.

## Diagrams

The primary tool is **D2** (MPL-2.0). Unlike Mermaid it produces SVG **at build
time**, so there is zero JavaScript and no CDN dependency on the reader's side.
Dark mode is baked into the SVG and follows the site's theme toggle.

### Flowchart

{{< d2 caption="A typical SSRF reaching the cloud metadata service" >}}
direction: right

attacker: Attacker { shape: person }
app: Application server
imds: Metadata service\n169.254.169.254 { shape: hexagon }
s3: Object storage

attacker -> app: Request with internal URL
app -> imds: Server fetches on its behalf
imds -> app: Temporary credentials
app -> attacker: Response leaks credentials
attacker -> s3: Direct access with stolen creds {
  style.stroke-dash: 3
  style.stroke: "#c2410c"
}
{{< /d2 >}}

### Sequence diagram

{{< d2 caption="A one round-trip TLS 1.3 handshake" >}}
shape: sequence_diagram

client: Client
server: Server

client -> server: ClientHello (key share)
server -> client: ServerHello (key share)
server -> client: EncryptedExtensions
server -> client: Certificate + CertificateVerify
server -> client: Finished
client -> server: Finished
client -> server: Application data
{{< /d2 >}}

### Sketch mode and an alternative layout

`sketch="true"` switches to a hand-drawn style; `layout="elk"` uses a different
engine that produces tidier layers for deeply nested graphs.

{{< d2 sketch="true" layout="elk" caption="Lab network tiers (sketch mode + ELK layout)" >}}
direction: down

net: Campus network {
  fw: Firewall
  mikrotik: MikroTik router
}

lab: OpenStack cluster {
  ctrl: Control node
  c1: Compute node 1
  c2: Compute node 2
  ceph: Storage
}

net.fw -> net.mikrotik
net.mikrotik -> lab.ctrl
lab.ctrl -> lab.c1
lab.ctrl -> lab.c2
lab.c1 -> lab.ceph
lab.c2 -> lab.ceph
{{< /d2 >}}

### Mermaid (fallback)

Mermaid covers the diagram types D2 lacks — Gantt charts, pie charts, mindmaps
and so on. Its 2.5 MB bundle only loads on pages that actually use it.

{{< mermaid caption="Project schedule" >}}
gantt
    dateFormat YYYY-MM-DD
    axisFormat %m/%d
    title Research schedule
    section Preparation
    Literature review   :done,    a1, 2026-09-01, 30d
    Environment setup   :active,  a2, 2026-09-20, 20d
    section Implementation
    Prototype           :         a3, after a2, 45d
    Experiments         :         a4, after a3, 30d
{{< /mermaid >}}

## Code

### Plain block

```python
import hashlib, hmac

def verify(secret: bytes, payload: bytes, signature: str) -> bool:
    """Constant-time comparison, so timing cannot leak the signature."""
    expected = hmac.new(secret, payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
```

### Line numbers and highlighted lines

Append `{linenos=true, hl_lines=[3-4]}` to the fence to call out specific lines:

```go {linenos=true, hl_lines=[3-4]}
func handler(w http.ResponseWriter, r *http.Request) {
    name := r.URL.Query().Get("name")
    // These two lines are the bug: user input goes straight into HTML
    fmt.Fprintf(w, "<h1>Hello %s</h1>", name)
    w.WriteHeader(http.StatusOK)
}
```

### Very long lines

Only the code block scrolls sideways; the page itself never overflows:

```bash
openstack server create --flavor m1.large --image ubuntu-24.04 --network lab-net --security-group default --key-name gamma4-lab-key --availability-zone nova my-instance
```

### Inline code

Highlighting is configured under `[markup.highlight]` in `config.toml`;
`noClasses` must be `false` so the palette comes from the theme's `_syntax.scss`.

## Everything else

| Component | Syntax | Rendered |
|-----------|--------|----------|
| Maths | `\( \)` / `$$ $$` | at build time |
| D2 diagram | `{{%/* d2 */%}}` | at build time |
| Mermaid | `{{%/* mermaid */%}}` | in the browser |
| Code | fenced block | at build time |

Footnotes work[^1], and so do block quotes:

> What goes unobserved disappears quietly.

[^1]: Footnotes collect at the end of the post with a link back to where they were cited.
