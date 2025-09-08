+++
title = "在 Android 上使用 RTL-SDR v4：完整入門與進階教學"
date = 2025-08-25
tags = ["RTL-SDR","無線電","Android","SDR","教學"]
categories = ["技術"]
+++

摘要  
本文詳述如何在 Android 裝置上使用 RTL‑SDR v4（基於 RTL2832U / R820T2 等晶片的 USB SDR 接收器）進行無線電接收與實驗。從硬體準備、必要配件、APP 安裝、初次連線與設定，一直到實務調校、常見應用與進階（例如使用 rtl_tcp 與遠端解碼）均有說明。目標群體為剛入門的資安 / 無線愛好者與想在行動裝置上做 SDR 的開發者或學生。

目錄
- 前提與注意事項
- 所需硬體與配件
- 常見 Android SDR 應用（App）概覽
- 實作步驟（逐步教學）
  - 1) 硬體接線與檢查
  - 2) 安裝並設定 SDR 應用（以 SDR Touch / RF Analyzer 為例）
  - 3) 調諧與基本參數調整（Sample Rate、Gain、Mode）
  - 4) 範例：收聽 FM 廣播 / NFM (語音) / SSB（業餘電台）
- 進階應用
  - 使用 rtl_tcp 與遠端解碼（在手機或樹莓派上）
  - 接收 ADS‑B / AIS / NOAA 氣象衛星（說明方法與工具）
- 訊號品質優化技巧
- 故障排除
- 安全與法規提醒
- 參考設定範例（快速對照表）

前提與注意事項
- 本文以 RTL‑SDR v4（通稱 RTL‑SDR，R820T2 等常見調諧器）為對象，其他 USB SDR 型號原則相同，但細節（驅動、相容性）可能不同。  
- Android 裝置需支援 USB OTG（Host）功能並具備相容的電力供應；部分手機對 USB 裝置供電有限，可能需要外接供電或使用 OTG OTG 供電集線器。  
- 請遵守當地無線電監管法律，不要接收或傳送未授權頻段／訊號（特別是加密或專用系統）。

所需硬體與配件
- RTL‑SDR v4 USB 接收器（或等效 RTL2832U / R820T2 裝置）  
- 支援 USB OTG 的 Android 手機或平板（Android 8+ 推薦）  
- USB OTG 轉接線（OTG 傳輸線：USB-C 或 micro‑USB 對 USB A 母座）  
- 低噪天線（隨裝置附贈天線可以測試；若要更好接收建議買更高增益或針對 VHF/UHF 的天線）  
- 若手機供電不足：USB OTG 帶外接電源的集線器（OTG HUB with power）  
- （進階）樹莓派或 PC，用於跑 rtl_tcp 或做後端解碼（選擇性）

常見 Android SDR 應用（可選）
- SDR++（建議首選，開源）：SDR++ 是一個跨平台且以社群維護為主的開源 SDR 前端，桌面版本成熟，社群也提供 Android 的預編譯包或可透過 Termux/Chroot 等方式執行。SDR++ 支援多種後端（rtl_tcp、SoapySDR 等），適合進階使用者與想在手機上連接遠端後端（如 rtl_tcp）的場景。  
- RF Analyzer（輕量且實用）：一款介面簡潔、反應快速的頻譜/分析工具，適合作為快速掃描與現場偵測的輔助工具；許多版本由社群維護，使用前建議參考其官方 repo 或 Play Store 說明以確認相容性。  
- 專用解碼工具：若要解 ADS‑B、AIS、WSPR 等，通常會把 RTL‑SDR 接到樹莓派或 PC，使用像 dump1090、rtl_ais、wsprd 等開源解碼器；手機則透過 rtl_tcp 或 SDR++ 連線來做監看與操作。

實作步驟（逐步教學）

1) 硬體接線與檢查
- 準備好 RTL‑SDR、天線與 USB OTG 線。  
- 將天線接到 RTL‑SDR（若為 SMA 接頭，確認有轉接頭）。  
- 手機關閉任何不必要的省電模式，插入 OTG 線，再插上 RTL‑SDR。若手機跳出 USB 權限要求，允許該 App 使用 USB 裝置。  
- 若裝置無法供電：使用帶電源的 OTG HUB，或使用外接電源給 RTL‑SDR（某些 RTL‑SDR 需要較高電流時才穩定）。

2) 安裝並設定 SDR 應用（以 SDR++ 或 RF Analyzer 為例）
- SDR++（建議）：如可取得 Android 預編譯包（APK）可直接安裝；若無預編譯包，建議在桌面或樹莓派上使用 SDR++ 作為後端，手機再透過 Network RTL‑TCP 或 SoapySDR 連線至該後端。SDR++ 支援多種來源（USB 本機、rtl_tcp、SoapySDR network），非常適合進階應用。  
- RF Analyzer（輕量）：可在 Play Store 或社群版安裝，介面適合快速掃描與現場監測。  
- 一般連線與權限流程（SDR++ / RF Analyzer 通用）：
  - 在 Play Store 或以可信來源安裝所選 App（若使用 SDR++ 的社群 APK，請確認來源可信）。  
  - 插入 RTL‑SDR，若系統彈出 USB 權限提示，允許 App 存取 USB 裝置。  
  - 在 App 設定中選擇裝置來源：本地 USB RTL（若 App 支援直接 USB）或 Network RTL‑TCP（若使用樹莓派/PC 做後端）。  
  - 推薦初始設定（依機種微調）：
    - Sample Rate（採樣率）：2.4 MSPS / 2.048 MSPS（低端手機可選 1.024 / 1.8 MSPS）  
    - Center Frequency：目標頻段（例如 88–108 MHz）  
    - Mode（調變）：WFM / NFM / AM / USB/LSB（依應用而定）  
    - Gain：AGC 或手動調整（先從中等值開始，視 SNR 與飽和情形微調）  
    - Bandwidth：依調變類型設定（WFM ≈150–200 kHz，NFM ≈12.5–25 kHz，SSB ≈2.4–3 kHz）
- SDR++ 額外提示：若使用 rtl_tcp 做後端，於 SDR++ 新增 Network Source（輸入主機 IP 與 Port），即可把重度解碼工作交給樹莓派/PC，手機僅做顯示與控制。

3) 調諧與基本參數調整
- 開啟 Waterfall（瀑布圖）與 Spectrum（頻譜），快速掃描找到信號。瀑布圖顏色越亮表示越強的訊號。  
- 微調 Gain：如果訊號飽和（頻譜頂部被平頂或出現雜訊），降低 Gain；訊號太小則提高 Gain。  
- 調整 Sample Rate 與 Bandwidth：若要接收寬頻 FM 廣播，採樣率 2.4MSps 效果較好；若為窄頻語音或 SSB，使用較小 bandwidth 可降低 CPU。  
- 選擇 Demod（解調）模式：WFM（廣播）、NFM（兩向無線電）、AM（航空或 AM 廣播）、SSB（業餘電台）等。  
- 開啟 AF（音頻）輸出，檢查能否直接在手機上聽到。某些 App 支援錄音或輸出到檔案。

4) 範例：收聽 FM 廣播
- 頻率：設定到例如 100.1 MHz。模式：WFM，帶寬 150–200 kHz。  
- 調整 Gain 直到訊號清晰且不失真。若有多頻干擾，微調中心頻率或加 FIR 濾波器（若 App 支援）。  
- 嘗試錄音並回放作比較。

進階應用

A) 使用 rtl_tcp 與遠端解碼（示意）
- 若你想用 Android 當作前端但把 RTL‑SDR 接在樹莓派或 PC 上做長時間監控與解碼（例如 ADS‑B、AIS、或使用專業解碼器），常見流程是：在樹莓派上跑 rtl_tcp，手機 App 連線到該服務。  
- 在樹莓派 / Linux 上啟動 rtl_tcp（先安裝 rtl‑sdr 套件）：
  - 指令範例： rtl_tcp -a 0.0.0.0 -p 1234  
  - 這會於 1234 port 提供 TCP 服務，允許遠端 App 連線。  
- 手機上的 App（SDR Touch 等）支援遠端 RTL‑TCP 來源，可在設定中改為「Network RTL‑TCP」並輸入樹莓派 IP 與 port。  
- 優點：可把解碼（像 dump1090、dump978、rtl_ais、wsjtx 等）留在樹莓派上，手機僅做介面與監看。

B) 接收 ADS‑B / AIS / NOAA 等
- ADS‑B（飛機回波）：通常使用 dump1090（在 PC / 樹莓派）。Android 原生 App 能接 rtl_tcp 再串接解碼器，但若只是想快速看，可把 RTL 接到 PC/樹莓派 並跑 dump1090。  
- NOAA 氣象衛星：接收 APT 圖像常需較高解析度的帶寬與後處理（需在桌面做解碼）；手機可用作即時監看，後處理在電腦上完成。

訊號品質優化技巧
- 天線位置：高、開闊且遠離電子干擾源（如 Wi‑Fi 路由器、手機充電器）越好。  
- 地面平衡與接地：若接收 HF，使用合適的接地或地平線可改善接收。  
- 濾波器：外接帶通濾波器（Bandpass）或高通濾波器可降低強訊號飽和與互調干擾。  
- 使用更好調諧器：部分 RTL‑SDR v4 內建較好晶片（R820T2），但若追求更好動態範圍可考慮更高階 SDR。

故障排除（常見問題）
- 手機不認出 RTL‑SDR：確認 OTG 支援、檢查 USB 線／接頭、嘗試有外接電源的 OTG HUB。  
- App 顯示裝置但沒資料：嘗試降低 Sample Rate、換 USB 供電方式、或在 App 設定中確認裝置型號。  
- 強訊號飽和：降低 Gain 或加濾波器。  
- 高延遲或崩潰：降低 Sample Rate，或關閉 App 的視覺化（降低 CPU 使用）。

安全與法規提醒
- 嚴禁用 RTL‑SDR 傳送或干擾合法通訊。接收特定頻段（例如軍用、警政、航空加密訊號）在部分地區受限或違法，務必遵守當地法律。  
- 接收加密或私人資訊也可能違法或違反隱私規定；純做學術、教學與公開頻段實驗。

參考設定範例（快速對照表）
- FM 廣播：Mode=WFM (stereo if supported), Sample Rate=2.4 MSPS, Bandwidth ≈150–200 kHz, Gain=AGC or 20–40 dB  
- NFM（語音短波）：Mode=NFM, Sample Rate=200–500 kSPS, Bandwidth ≈12.5–25 kHz, Gain 根據情況調整  
- SSB（業餘）：Mode=USB/LSB, Sample Rate=500–1000 kSPS, Bandwidth ≈2.4–3 kHz

結語  
使用 RTL‑SDR v4 在 Android 上可快速完成移動式無線電監測與實驗，適合做初步學習、行動偵測或展示。但若要做長時間或大量解碼（ADS‑B、AIS、WSPR 等），建議搭配固定的樹莓派或 PC 後端來跑專用解碼器，手機則作為控制與即時顯示介面。若你想，我可以為你：
- 產生一份可直接貼到部落格的 Markdown（含圖片示意與指令片段）——本文已為 Markdown 格式，可直接放到 posts 下；或
- 幫你製作一個附圖版本（需要你上傳示意圖或允許我加入示意占位圖），或
- 撰寫進階篇章（例如：實作 rtl_tcp + dump1090 完整流程，或在 Android 上跑 SDR++ 的教學）。
