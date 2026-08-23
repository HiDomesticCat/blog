+++
title = "專案作品"
slug = "projects"
description = "于京平（hicat0x0）的專案與研究：零知識加密雲端系統、日誌異常偵測、拍攝來源驗證、量子與平行演算法視覺化與機器學習實作。"
+++

以下是我參與或主導的專案與研究方向，完整清單請見
[GitHub @HiDomesticCat](https://github.com/HiDomesticCat?tab=repositories)。

---

## 資安與系統研究

### DCFS — 零知識加密雲端檔案系統

以 AWS Serverless 架構實作的雲端檔案系統，重點在「伺服器端看不到你的檔案」。
標記為私密的檔案在離開瀏覽器之前就先在前端加密：
以 PBKDF2 從使用者另設的加密密碼衍生主金鑰（MEK），
每個檔案再產生一把一次性的資料金鑰（DEK）以 AES-GCM 加密內容，
DEK 本身由 MEK 包裝後才連同 IV 一起上傳，伺服器只拿得到密文與包裝過的金鑰。

權限分為未登入訪客、一般使用者與管理員三級，
檔案傳輸走 S3 預簽章 URL，中繼資料存於 DynamoDB，身分驗證由 Cognito 簽發 JWT。

- **技術**：AWS Lambda (Node.js), API Gateway, S3, DynamoDB, Cognito, Web Crypto API
- **原始碼**：[aws_finalwork](https://github.com/HiDomesticCat/aws_finalwork)

---

### DeepCASE 日誌關聯與異常偵測

針對 syslog 事件序列做半監督式關聯分析，
自動找出事件之間的相關性並偵測異常樣態（例如 SSH 暴力破解），
目標是降低資安維運的告警疲勞（alert fatigue）。
支援 rsyslog、遠端主機與檔案等多種來源，
告警可送往主控台、Email、Webhook 或 Slack。

- **技術**：Python, PyTorch, scikit-learn, DeepCASE
- **原始碼**：[deepCASE_research](https://github.com/HiDomesticCat/deepCASE_research)

---

### SpectraLens — 拍攝來源驗證

驗證一張照片「真的是這台裝置、在這個位置拍的」的概念驗證。
前端是 Flutter 拍攝 App，後端以 FastAPI 提供簽章挑戰與上傳驗證，
把 WebAuthn／Passkey 的裝置綁定、Google Play Integrity 的裝置完整性檢查
與地理位置資訊組合成一條信任鏈。

目前處於 PoC 階段，外部驗證流程仍為模擬實作。

- **技術**：Flutter / Dart, FastAPI, WebAuthn, Play Integrity API
- **原始碼**：[YummYYummY](https://github.com/HiDomesticCat/YummYYummY)（App）／
  [YummYYummY_backend](https://github.com/HiDomesticCat/YummYYummY_backend)（後端）

---

### WannaMock — 檔案加密實作

以 C 語言從零實作檔案加密流程的教學專案：
遞迴走訪目錄、二進位檔案讀寫，加密方式由早期的凱撒位移逐步演進到 RSA，
並自行實作快速冪模運算。專案文件記錄了每一版遇到的記憶體溢位與檔案損毀問題。

僅供學術與教學用途，以 GPL-3.0 釋出。

- **技術**：C, GCC, RSA, 快速冪模運算
- **原始碼**：[WannaMock_virus_program](https://github.com/HiDomesticCat/WannaMock_virus_program)

---

## 演算法、機器學習與視覺化

### Grover 演算法視覺化

互動式的量子搜尋演算法教學工具，
逐步呈現疊加、相位翻轉與振幅放大的過程，
讓使用者選定目標狀態後觀察機率如何集中到搜尋結果上。
後端以 Qiskit 實際模擬量子線路（可選噪音模型）。

- **技術**：React, TypeScript, FastAPI, Qiskit
- **原始碼**：[Grover-demo](https://github.com/HiDomesticCat/Grover-demo)

---

### Hypercube 路由視覺化

在超立方體網路上比較五種繞徑演算法（BFS、A\*、Beam search、Batcher 排序等），
逐步播放尋路過程，並跨不同維度做統計比較。
第三方函式庫全部在地打包，可離線執行。

- **技術**：React, 自訂 design token 樣式系統
- **原始碼**：[Hypercube-demo](https://github.com/HiDomesticCat/Hypercube-demo)

---

### sushi-sync — 作業系統同步模擬

用壽司店的座位競爭來演示作業系統的多執行緒、資源配置與同步機制
（mutex、條件變數）。提供即時平面圖、座位設定、時間軸回放，
以及吞吐量、周轉時間、等待時間等指標，結果可匯出成 JSON／CSV／純文字。

- **技術**：Svelte 5, Tailwind CSS, Rust, Tauri
- **原始碼**：[sushi-sync](https://github.com/HiDomesticCat/sushi-sync)

---

### PSO-ANN-XOR — 用粒子群最佳化訓練類神經網路

不用反向傳播，改以粒子群最佳化（PSO）訓練一個 2-2-1 的類神經網路解 XOR 問題。
50 個粒子、最多 2000 次迭代，損失低於 0.001 即提前停止，並輸出收斂曲線圖。

- **技術**：Rust, `rand`, `plotters`
- **原始碼**：[PSO-ANN-XOR](https://github.com/HiDomesticCat/PSO-ANN-XOR)

---

### MNIST — CNN 手寫辨識訓練與部署

以卷積神經網路做 MNIST 手寫數字辨識，重點放在「訓練完之後怎麼上線」：
匯出成 SavedModel、用 TensorFlow Serving 提供 REST 與 gRPC 介面、
以 Docker 打包 CPU／GPU 環境，並支援在 GPU 上訓練、匯出到純 CPU 推論機。

- **技術**：TensorFlow, TensorFlow Serving, Docker
- **原始碼**：[MNIST](https://github.com/HiDomesticCat/MNIST)

---

## 應用與課程專案

### 商品查詢系統

資料庫課程專案。全端商品搜尋與購物車系統，
支援關鍵字查詢、分類瀏覽與購物車操作，
資料庫存取一律使用參數化查詢以避免 SQL injection。

- **技術**：Python Flask, SQLite3, HTML / CSS / JavaScript
- **原始碼**：[NUTN_DataBase_project](https://github.com/HiDomesticCat/NUTN_DataBase_project)

---

## 網站與筆記

### hicat0x0 Blog

個人技術部落格，使用 Hugo + hugo-coder 主題搭建，部署於 GitHub Pages。
記錄 CTF 解題、資安研究筆記與技術學習心得。

- **技術**：Hugo, Markdown, GitHub Actions, GitHub Pages
- **連結**：[blog.hicat0x0.uk](https://blog.hicat0x0.uk)
- **原始碼**：[blog](https://github.com/HiDomesticCat/blog)

---

### 開放筆記站

將課堂筆記、學習資源與技術文件整理成線上可查閱的格式，開放給同學與社群參考。

- **技術**：Logseq
- **連結**：[note.hicat0x0.uk](https://note.hicat0x0.uk)
- **原始碼**：[nutn_note](https://github.com/HiDomesticCat/nutn_note)
