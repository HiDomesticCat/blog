+++
title = "Technical Writing Components"
slug = "tech-rendering-demo"
date = 2026-08-28
description = "Every component available for technical posts here, and the things that do not work."
categories = ["Notes"]
tags = ["writing", "tooling"]
+++

Every component available for technical posts on this site, along with the
limits I have actually run into[^1]. Everything below is really rendered rather
than screenshotted — diagrams enlarge from the button in their corner, code
copies, and all of the text selects. I come back to this page when writing.

## Mathematics

Rendered **at build time** with KaTeX. No JavaScript is needed in the browser,
and no `math = true` in front matter.

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
> With single dollars enabled, "the rig costs $50000 to $60000" has
> `$50000 to $` swallowed as an inline formula. Prices are common in technical
> writing, so inline maths always uses the parenthesis form.

## Diagrams

The primary tool is **D2** (MPL-2.0). Unlike Mermaid it produces SVG **at build
time**, so readers download no JavaScript and there is no CDN dependency. Dark
mode is baked into the SVG and follows the site theme toggle.

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

{{< d2 caption="OAuth 2.0 authorisation code flow" >}}
shape: sequence_diagram

user: User
app: Client app
idp: Authorisation server
api: Resource server

user -> app: Clicks sign in
app -> idp: Redirect to authorise endpoint
idp -> user: Consent screen
user -> idp: Approves
idp -> app: Authorisation code
app -> idp: Exchange code for token
idp -> app: access_token
app -> api: Call with token
api -> app: Data
{{< /d2 >}}

### Class diagram

{{< d2 caption="UML classes with visibility and types" >}}
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

Cipher -> AEAD: implements
{{< /d2 >}}

### ER diagram

{{< d2 caption="sql_table shapes with key constraints" >}}
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

sessions.user_id -> users.id: many to one
{{< /d2 >}}

### State machine

D2 has no dedicated state-machine syntax; a plain directed graph does the job.

{{< d2 caption="TCP connection states (excerpt)" >}}
direction: right
CLOSED -> LISTEN: passive open
LISTEN -> SYN_RCVD: SYN received
SYN_RCVD -> ESTABLISHED: ACK received
ESTABLISHED -> FIN_WAIT_1: active close
FIN_WAIT_1 -> TIME_WAIT: FIN+ACK received
TIME_WAIT -> CLOSED: 2MSL timeout
{{< /d2 >}}

### Nested containers and network layout

`layout="elk"` switches engines; it lays deep hierarchies out more tidily.

{{< d2 layout="elk" caption="Containers nest arbitrarily and edges cross levels" >}}
direction: down

internet: Internet {shape: cloud}

edge: Edge {
  fw: Firewall
  lb: Load balancer
  fw -> lb
}

app: Application {
  web1: Web 1
  web2: Web 2
}

data: Data {
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

### Grid layout

{{< d2 caption="grid suits matrices and comparison tables" >}}
grid-rows: 3
grid-columns: 3

Confidentiality; Integrity; Availability
Encryption; Hashing; Redundancy
TLS; HMAC; Clustering
{{< /d2 >}}

### Shape library

{{< d2 layout="elk" caption="Built-in shapes, enough for architecture diagrams" >}}
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

### Styling and emphasis

{{< d2 caption="classes define reusable styles" >}}
direction: right

classes: {
  danger: {
    style: {fill: "#fee2e2"; stroke: "#dc2626"; stroke-width: 2}
  }
  safe: {
    style: {fill: "#dcfce7"; stroke: "#16a34a"}
  }
}

Input -> Unvalidated deserialisation {class: danger}
Unvalidated deserialisation -> Remote execution {class: danger}
Input -> Allowlisted type check {class: safe}
Allowlisted type check -> Safe handling {class: safe}
{{< /d2 >}}

### Edge styles

{{< d2 caption="Dashes, weight, colour, bidirectional, arrowheads" >}}
direction: right
a -> b: solid
c -> d: dashed {style.stroke-dash: 4}
e -> f: thick {style.stroke-width: 4}
g <-> h: bidirectional
i -- j: undirected
k -> l: diamond head {source-arrowhead.shape: diamond; target-arrowhead.shape: triangle}
{{< /d2 >}}

### Markdown inside shapes

{{< d2 caption="Nodes can hold Markdown - lists, headings, bold" >}}
direction: right

Checks: |md
  ### Order of checks
  1. Verify source IP
  2. Compare signature
  3. Check timestamp
|

Result: Handle only if all pass

Checks -> Result
{{< /d2 >}}

### Sketch mode

{{< d2 sketch="true" caption="sketch mode, good for rough ideas" >}}
direction: right
Idea -> Prototype -> Experiment -> Paper
Experiment -> Idea: did not work out
{{< /d2 >}}

### Mermaid (fallback)

Mermaid covers the types D2 lacks. Its 2.5 MB bundle only loads on pages that
actually use it.

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

### What D2 cannot do

Limits I have actually hit, recorded so I do not retry them:

| Item | Status | Workaround |
|------|--------|------------|
| Gantt chart | No such syntax; the keyword is parsed as a node name | Use Mermaid |
| Pie / bar chart | Same | Use Mermaid, or a table |
| Mindmap | Same | Approximate with a tree |
| LaTeX block | Panics, failing the build | Put maths outside the diagram |
| Code block inside a shape | Text overflows its shape by 13-24px | Use a Markdown block instead |
| Remote icon URL | The URL is written into the SVG, so readers fetch it | Use a local file |

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

Append `{linenos=true, hl_lines=[3-4]}` to the fence:

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

Configured under `[markup.highlight]` in `config.toml`; `noClasses` must be
`false` so the palette comes from the theme `_syntax.scss`. The monospace face
is a self-hosted JetBrains Mono.

## Everything else

| Component | Syntax | Rendered |
|-----------|--------|----------|
| Maths | parentheses / double dollars | at build time |
| D2 diagram | d2 shortcode | at build time |
| Mermaid | mermaid shortcode | in the browser |
| Code | fenced block | at build time |

Block quotes:

> What goes unobserved disappears quietly.

[^1]: Footnotes collect at the end. The reference is deliberately near the top
    of the page — with the two close together the view barely moves and you
    cannot tell whether the jump happened. The target flashes briefly on
    arrival, and so does the reference when you jump back.
