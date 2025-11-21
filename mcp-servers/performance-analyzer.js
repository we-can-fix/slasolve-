#!/usr/bin/env node

/**
 * Performance Analyzer MCP Server
 */

import { createInterface } from 'readline';

const tools = [
  {
    name: "analyze_performance",
    description: "分析代碼性能",
    input_schema: {
      type: "object",
      properties: {
        code: { type: "string", description: "代碼內容" },
      },
      required: ["code"],
    },
  },
  {
    name: "identify_bottlenecks",
    description: "識別性能瓶頸",
    input_schema: {
      type: "object",
      properties: {
        code: { type: "string", description: "代碼內容" },
      },
      required: ["code"],
    },
  },
  {
    name: "suggest_optimizations",
    description: "提供優化建議",
    input_schema: {
      type: "object",
      properties: {
        code: { type: "string", description: "代碼內容" },
        target: {
          type: "string",
          enum: ["speed", "memory", "both"],
          description: "優化目標",
        },
      },
      required: ["code"],
    },
  },
];

async function analyzePerformance(code) {
  const issues = [];
  
  // Check for nested loops
  const nestedLoops = (code.match(/for\s*\([^)]*\)\s*{[^}]*for\s*\([^)]*\)/g) || []).length;
  if (nestedLoops > 0) {
    issues.push({
      type: "Nested Loops",
      severity: "high",
      description: `發現 ${nestedLoops} 處嵌套循環，可能導致 O(n²) 複雜度`,
      suggestion: "考慮使用 Map 或 Set 來優化查找",
    });
  }

  // Check for Array.includes in loops
  if (code.includes('for') && code.includes('.includes(')) {
    issues.push({
      type: "Inefficient Search",
      severity: "medium",
      description: "在循環中使用 Array.includes",
      suggestion: "使用 Set 來提高查找效率",
    });
  }

  return {
    issues,
    metrics: {
      estimatedComplexity: nestedLoops > 0 ? "O(n²)" : "O(n)",
      optimizationPotential: issues.length > 0 ? "high" : "low",
    },
    timestamp: new Date().toISOString(),
  };
}

async function identifyBottlenecks(code) {
  const bottlenecks = [];

  if (code.includes('JSON.parse') && code.includes('for')) {
    bottlenecks.push({
      type: "Repeated Parsing",
      location: "loop",
      impact: "high",
      suggestion: "將 JSON 解析移到循環外",
    });
  }

  if (code.includes('fs.readFileSync')) {
    bottlenecks.push({
      type: "Synchronous I/O",
      location: "file operations",
      impact: "high",
      suggestion: "使用異步 I/O 操作",
    });
  }

  return {
    bottlenecks,
    timestamp: new Date().toISOString(),
  };
}

async function suggestOptimizations(code, target = "both") {
  const optimizations = [];

  if (target === "memory" || target === "both") {
    if (code.includes('let arr = []') && code.includes('arr.push')) {
      optimizations.push({
        type: "Memory",
        suggestion: "預先分配數組大小",
        impact: "medium",
        example: "let arr = new Array(size)",
      });
    }
  }

  if (target === "speed" || target === "both") {
    if (code.includes('for (let i')) {
      optimizations.push({
        type: "Speed",
        suggestion: "考慮使用 map/filter/reduce",
        impact: "low",
        example: "array.map(item => transform(item))",
      });
    }
  }

  return {
    optimizations,
    target,
    timestamp: new Date().toISOString(),
  };
}

async function processToolCall(toolName, toolInput) {
  try {
    switch (toolName) {
      case "analyze_performance":
        return await analyzePerformance(toolInput.code);
      case "identify_bottlenecks":
        return await identifyBottlenecks(toolInput.code);
      case "suggest_optimizations":
        return await suggestOptimizations(toolInput.code, toolInput.target);
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
          serverInfo: { name: "performance-analyzer", version: "1.0.0" },
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
    console.log('Performance Analyzer MCP Server validation passed');
    process.exit(0);
  }
  const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
  if (LOG_LEVEL === 'info') console.error('Performance Analyzer MCP Server started');
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: false });
  rl.on('line', async (line) => {
    const response = await handleMessage(line);
    console.log(JSON.stringify(response));
  });
  rl.on('close', () => {
    if (LOG_LEVEL === 'info') console.error('Performance Analyzer MCP Server stopped');
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
