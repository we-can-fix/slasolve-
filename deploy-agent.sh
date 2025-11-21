#!/bin/bash
# deploy-agent.sh
# AutoExecutionEngine Agent 部署腳本

set -e

echo "🚀 開始部署 AutoExecutionEngine Agent..."

# 1. 驗證文件結構
echo "✓ 檢查文件結構..."
if [ ! -f ".github/agents/my-agent.agent.md" ]; then
  echo "❌ Agent 文件不存在"
  exit 1
fi
echo "  ✓ Agent 配置文件存在"

# 2. 檢查 MCP 服務器文件
echo "✓ 檢查 MCP 服務器..."
MCP_SERVERS=(
  "code-analyzer.js"
  "test-generator.js"
  "doc-generator.js"
  "slsa-validator.js"
  "security-scanner.js"
  "performance-analyzer.js"
)

for server in "${MCP_SERVERS[@]}"; do
  if [ ! -f "mcp-servers/$server" ]; then
    echo "  ❌ MCP 服務器不存在: $server"
    exit 1
  fi
  echo "  ✓ $server"
done

# 3. 驗證 Node.js 語法
echo "✓ 驗證 JavaScript 語法..."
cd mcp-servers
for server in "${MCP_SERVERS[@]}"; do
  node --check "$server" 2>/dev/null && echo "  ✓ $server 語法正確" || {
    echo "  ❌ $server 語法錯誤"
    exit 1
  }
done
cd ..

# 4. 驗證 package.json
echo "✓ 驗證 package.json..."
if [ -f "mcp-servers/package.json" ]; then
  echo "  ✓ package.json 存在"
else
  echo "  ❌ package.json 不存在"
  exit 1
fi

# 5. 檢查環境配置
echo "✓ 檢查環境配置..."
if [ -f ".env.agent" ]; then
  echo "  ✓ .env.agent 存在"
else
  echo "  ⚠️  .env.agent 不存在（可選）"
fi

echo ""
echo "✅ AutoExecutionEngine Agent 部署驗證完成！"
echo ""
echo "📝 下一步："
echo "  1. 安裝依賴: cd mcp-servers && npm install"
echo "  2. 測試 Agent: ./test-agent.sh"
echo "  3. 提交更改: git add . && git commit -m 'feat: add AutoExecutionEngine Agent'"
echo "  4. 推送到遠程: git push"
echo ""
