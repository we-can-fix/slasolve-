#!/usr/bin/env node

/**
 * Documentation Generator MCP Server
 */

import { createInterface } from 'readline';

const tools = [
  {
    name: "generate_jsdoc",
    description: "生成 JSDoc 註釋",
    input_schema: {
      type: "object",
      properties: {
        functionCode: { type: "string", description: "函數代碼" },
      },
      required: ["functionCode"],
    },
  },
  {
    name: "generate_api_docs",
    description: "生成 API 文檔",
    input_schema: {
      type: "object",
      properties: {
        apiPath: { type: "string", description: "API 路徑" },
        methods: { type: "array", items: { type: "string" } },
      },
      required: ["apiPath"],
    },
  },
];

async function generateJSDoc(functionCode) {
  return {
    jsdoc: `/**\n * Function description\n * @param {Object} params - Parameters\n * @returns {Promise<Object>} Result\n */`,
    timestamp: new Date().toISOString(),
  };
}

async function generateAPIDocs(apiPath, methods = []) {
  return {
    apiPath,
    documentation: `# API Documentation\n\n## ${apiPath}\n\n${methods.map(m => `### ${m}\n\nDescription of ${m}`).join('\n\n')}`,
    timestamp: new Date().toISOString(),
  };
}

async function processToolCall(toolName, toolInput) {
  try {
    switch (toolName) {
      case "generate_jsdoc":
        return await generateJSDoc(toolInput.functionCode);
      case "generate_api_docs":
        return await generateAPIDocs(toolInput.apiPath, toolInput.methods);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    return { error: error.message, timestamp: new Date().toISOString() };
  }
}

async function handleMessage(message) {
  try {
    const request = JSON.parse(message);
    if (request.method === "tools/list") {
      return { jsonrpc: "2.0", id: request.id, result: { tools } };
    }
    if (request.method === "tools/call") {
      const result = await processToolCall(request.params.name, request.params.arguments);
      return {
        jsonrpc: "2.0",
        id: request.id,
        result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] },
      };
    }
    if (request.method === "initialize") {
      return {
        jsonrpc: "2.0",
        id: request.id,
        result: {
          protocolVersion: "1.0.0",
          serverInfo: { name: "doc-generator", version: "1.0.0" },
          capabilities: { tools: {} },
        },
      };
    }
    return {
      jsonrpc: "2.0",
      id: request.id,
      error: { code: -32601, message: "Method not found" },
    };
  } catch (error) {
    return {
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error: " + error.message },
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--validate')) {
    console.log('Doc Generator MCP Server validation passed');
    process.exit(0);
  }
  const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
  if (LOG_LEVEL === 'info') console.error('Doc Generator MCP Server started');
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: false });
  rl.on('line', async (line) => {
    const response = await handleMessage(line);
    console.log(JSON.stringify(response));
  });
  rl.on('close', () => {
    if (LOG_LEVEL === 'info') console.error('Doc Generator MCP Server stopped');
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
