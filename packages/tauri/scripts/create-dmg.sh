#!/bin/bash

APP_NAME="visualization-editor"
VERSION="0.0.1"
BUNDLE_DIR="target/release/bundle/macos"
APP_PATH="${BUNDLE_DIR}/${APP_NAME}.app"
DMG_NAME="${APP_NAME}_${VERSION}_x64.dmg"

if [ ! -d "$APP_PATH" ]; then
  echo "错误: 找不到 app 文件: $APP_PATH"
  echo "请先运行: pnpm build:tauri"
  exit 1
fi

cd "$(dirname "$0")/.."

echo "正在创建 DMG..."
hdiutil create -volname "$APP_NAME" \
  -srcfolder "$APP_PATH" \
  -ov -format UDZO \
  "${BUNDLE_DIR}/${DMG_NAME}"

if [ $? -eq 0 ]; then
  echo "✅ DMG 创建成功: ${BUNDLE_DIR}/${DMG_NAME}"
else
  echo "❌ DMG 创建失败"
  exit 1
fi

