#!/usr/bin/env bash
#
# 本機建置 / 預覽腳本
#
#   ./build-and-deploy.sh serve   # 啟動本機預覽伺服器（含草稿）
#   ./build-and-deploy.sh build   # 用與 CI 相同的參數做一次建置檢查（預設）
#
# 注意：實際部署由 GitHub Actions 負責（.github/workflows/deploy.yml）。
#       這支腳本刻意不碰 git、也不寫 docs/，避免與 CI 互相覆蓋。
#
set -euo pipefail

BASE_URL="https://blog.hicat0x0.uk/"
PORT="${PORT:-1313}"
MODE="${1:-build}"

command -v hugo >/dev/null 2>&1 || {
  echo "找不到 hugo。請先安裝 Hugo Extended（CI 使用 0.145.0）。" >&2
  exit 1
}

echo "使用的 Hugo：$(hugo version)"

case "$MODE" in
  serve)
    echo "啟動預覽伺服器 → http://localhost:${PORT}/zh/"
    exec hugo server --bind 0.0.0.0 --port "$PORT" --buildDrafts --disableFastRender
    ;;

  build)
    echo "清除舊的產出…"
    rm -rf public resources .hugo_build.lock

    echo "建置中（與 CI 相同參數）…"
    hugo --minify --gc --baseURL "$BASE_URL"

    echo "檢查產出…"
    fail=0
    for f in public/index.html public/zh/index.html public/en/index.html public/CNAME; do
      if [ -f "$f" ]; then
        echo "  OK   $f"
      else
        echo "  FAIL $f 不存在"
        fail=1
      fi
    done
    [ "$fail" -eq 0 ] || { echo "建置檢查未通過。" >&2; exit 1; }

    echo "CNAME → $(cat public/CNAME)"
    echo "建置完成。產出在 public/（不進版控；部署交給 GitHub Actions）。"
    ;;

  *)
    echo "用法：$0 [serve|build]" >&2
    exit 2
    ;;
esac
