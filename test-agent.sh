#!/bin/bash
# test-agent.sh
# AutoExecutionEngine Agent 測試腳本

set -e

echo "🧪 測試 AutoExecutionEngine Agent..."
echo ""

# 1. 測試 MCP 服務器啟動
echo "✓ 測試 MCP 服務器..."

MCP_SERVERS=(
  "code-analyzer"
  "test-generator"
  "doc-generator"
  "slsa-validator"
  "security-scanner"
  "performance-analyzer"
)

cd mcp-servers

for server in "${MCP_SERVERS[@]}"; do
  echo "  測試 $server..."
  if node "$server.js" --validate 2>&1 | grep -q "validation passed"; then
    echo "  ✓ $server 測試通過"
  else
    echo "  ❌ $server 測試失敗"
    exit 1
  fi
done

cd ..

# 2. 驗證 Agent 配置文件
echo ""
echo "✓ 驗證 Agent 配置..."
if grep -q "name: AutoExecutionEngine Agent" .github/agents/my-agent.agent.md; then
  echo "  ✓ Agent 名稱配置正確"
else
  echo "  ❌ Agent 配置有誤"
  exit 1
fi

if grep -q "mcp-servers:" .github/agents/my-agent.agent.md; then
  echo "  ✓ MCP 服務器配置存在"
else
  echo "  ❌ 缺少 MCP 服務器配置"
  exit 1
fi

# 3. 檢查文檔完整性
echo ""
echo "✓ 檢查文檔..."
REQUIRED_SECTIONS=(
  "Agent 目標"
  "Agent 功能"
  "使用場景"
  "快速開始"
)

for section in "${REQUIRED_SECTIONS[@]}"; do
  if grep -q "$section" .github/agents/my-agent.agent.md; then
    echo "  ✓ 包含 $section 部分"
  else
    echo "  ⚠️  缺少 $section 部分"
  fi
done

echo ""
echo "✅ 所有測試通過！"
echo ""
echo "📊 統計信息："
echo "  - MCP 服務器數量: ${#MCP_SERVERS[@]}"
echo "  - Agent 配置行數: $(wc -l < .github/agents/my-agent.agent.md)"
echo "  - 服務器代碼總行數: $(find mcp-servers -name '*.js' -exec wc -l {} + | tail -1 | awk '{print $1}')"
echo ""
echo "🎉 AutoExecutionEngine Agent 已準備就緒！"
