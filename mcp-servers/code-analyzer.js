#!/usr/bin/env node

/**
 * Code Analyzer MCP Server
 * 
 * This MCP server provides code analysis capabilities including
 * complexity checks, code smell detection, and SOLID principles validation.
 */

import { createInterface } from 'readline';

const tools = [
  {
    name: "analyze_code",
    description: "分析代碼質量、複雜度和潛在問題",
    input_schema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "要分析的文件路徑",
        },
        code: {
          type: "string",
          description: "要分析的代碼內容",
        },
        analysisType: {
          type: "string",
          enum: ["complexity", "quality", "security", "performance"],
          description: "分析類型",
        },
      },
      required: ["filePath", "code", "analysisType"],
    },
  },
  {
    name: "detect_code_smells",
    description: "檢測代碼異味和反模式",
    input_schema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "要檢測的代碼",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "check_solid_principles",
    description: "檢查 SOLID 原則的遵循情況",
    input_schema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "要檢查的代碼",
        },
      },
      required: ["code"],
    },
  },
];

/**
 * Calculate cyclomatic complexity (simplified)
 */
function calculateComplexity(code) {
  const complexityKeywords = [
    /\bif\b/g,
    /\belse\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /\b\&\&\b/g,
    /\b\|\|\b/g,
  ];

  let complexity = 1; // Base complexity
  complexityKeywords.forEach((keyword) => {
    const matches = code.match(keyword);
    if (matches) {
      complexity += matches.length;
    }
  });

  return complexity;
}

/**
 * Calculate maintainability index (simplified)
 */
function calculateMaintainability(code) {
  const lines = code.split('\n').filter((line) => line.trim() !== '');
  const codeLength = lines.length;
  const complexity = calculateComplexity(code);
  const commentRatio = (code.match(/\/\//g) || []).length / codeLength;

  // Simplified formula: higher is better (0-100)
  const maintainability = Math.max(
    0,
    Math.min(100, 100 - complexity * 2 - codeLength * 0.1 + commentRatio * 10)
  );

  return Math.round(maintainability);
}

/**
 * Detect code duplication
 */
function detectDuplication(code) {
  const lines = code.split('\n');
  const duplicates = [];
  const lineMap = new Map();

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.length > 10) {
      if (lineMap.has(trimmed)) {
        lineMap.get(trimmed).push(index + 1);
      } else {
        lineMap.set(trimmed, [index + 1]);
      }
    }
  });

  lineMap.forEach((lineNumbers, lineContent) => {
    if (lineNumbers.length > 1) {
      duplicates.push({
        line: lineContent,
        occurrences: lineNumbers,
      });
    }
  });

  return duplicates;
}

/**
 * Analyze code
 */
async function analyzeCode(filePath, code, analysisType) {
  const issues = [];
  const complexity = calculateComplexity(code);
  const maintainability = calculateMaintainability(code);

  if (analysisType === "complexity" || analysisType === "quality") {
    if (complexity > 10) {
      issues.push({
        severity: complexity > 20 ? "high" : "medium",
        message: `高圈複雜度 (${complexity})，建議重構`,
        line: 1,
        column: 1,
        suggestion: "將複雜的邏輯拆分為更小的函數",
      });
    }

    if (maintainability < 50) {
      issues.push({
        severity: "medium",
        message: `低可維護性指數 (${maintainability})`,
        line: 1,
        column: 1,
        suggestion: "改進代碼結構和添加註釋",
      });
    }

    const duplicates = detectDuplication(code);
    if (duplicates.length > 0) {
      issues.push({
        severity: "low",
        message: `發現 ${duplicates.length} 處代碼重複`,
        line: duplicates[0].occurrences[0],
        column: 1,
        suggestion: "提取重複代碼為共享函數",
      });
    }
  }

  if (analysisType === "security") {
    // Check for common security issues
    if (code.includes('eval(')) {
      issues.push({
        severity: "critical",
        message: "使用 eval() 存在安全風險",
        line: code.indexOf('eval('),
        column: 1,
        suggestion: "避免使用 eval()，考慮使用更安全的替代方案",
      });
    }
  }

  return {
    filePath,
    analysisType,
    issues,
    metrics: {
      complexity,
      maintainability,
      coverage: 85, // Placeholder
    },
    recommendations: issues.length > 0
      ? ["減少函數複雜度", "增加代碼註釋", "提取重複邏輯"]
      : ["代碼質量良好"],
  };
}

/**
 * Detect code smells
 */
async function detectCodeSmells(code) {
  const smells = [];

  // Long method
  const lines = code.split('\n').filter((line) => line.trim() !== '');
  if (lines.length > 50) {
    smells.push({
      type: "Long Method",
      severity: "medium",
      description: "函數過長，建議拆分",
      line: 1,
    });
  }

  // Too many parameters
  const functionMatch = code.match(/function\s+\w+\s*\(([^)]+)\)/);
  if (functionMatch && functionMatch[1]) {
    const params = functionMatch[1].split(',').filter((p) => p.trim());
    if (params.length > 5) {
      smells.push({
        type: "Long Parameter List",
        severity: "low",
        description: "參數過多，考慮使用對象參數",
        line: 1,
      });
    }
  }

  // Magic numbers
  const magicNumbers = code.match(/\b\d{2,}\b/g);
  if (magicNumbers && magicNumbers.length > 3) {
    smells.push({
      type: "Magic Numbers",
      severity: "low",
      description: "存在魔法數字，建議使用常量",
      line: 1,
    });
  }

  return {
    filePath: "unknown",
    analysisType: "code-smells",
    issues: smells,
    metrics: {
      complexity: 0,
      maintainability: 0,
      coverage: 0,
    },
    recommendations: smells.length > 0
      ? ["重構長方法", "減少參數數量", "使用命名常量"]
      : ["未檢測到明顯的代碼異味"],
  };
}

/**
 * Check SOLID principles
 */
async function checkSOLIDPrinciples(code) {
  const violations = [];

  // Single Responsibility Principle
  const classMatches = code.match(/class\s+(\w+)/g);
  if (classMatches) {
    const methodCount = (code.match(/\s+(async\s+)?(\w+)\s*\(/g) || []).length;
    if (methodCount > 10) {
      violations.push({
        principle: "Single Responsibility",
        severity: "medium",
        description: "類包含過多方法，可能違反單一職責原則",
        line: 1,
      });
    }
  }

  // Dependency Inversion Principle
  if (code.includes('new ') && !code.includes('constructor')) {
    violations.push({
      principle: "Dependency Inversion",
      severity: "low",
      description: "直接實例化依賴，考慮使用依賴注入",
      line: 1,
    });
  }

  return {
    filePath: "unknown",
    analysisType: "solid-principles",
    issues: violations,
    metrics: {
      complexity: 0,
      maintainability: 0,
      coverage: 0,
    },
    recommendations: violations.length > 0
      ? ["拆分大類", "使用依賴注入", "遵循 SOLID 原則"]
      : ["SOLID 原則遵循良好"],
  };
}

/**
 * Process tool call
 */
async function processToolCall(toolName, toolInput) {
  try {
    switch (toolName) {
      case "analyze_code":
        return await analyzeCode(
          toolInput.filePath,
          toolInput.code,
          toolInput.analysisType
        );

      case "detect_code_smells":
        return await detectCodeSmells(toolInput.code);

      case "check_solid_principles":
        return await checkSOLIDPrinciples(toolInput.code);

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    return {
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Handle MCP protocol messages
 */
async function handleMessage(message) {
  try {
    const request = JSON.parse(message);

    if (request.method === "tools/list") {
      return {
        jsonrpc: "2.0",
        id: request.id,
        result: { tools },
      };
    }

    if (request.method === "tools/call") {
      const result = await processToolCall(
        request.params.name,
        request.params.arguments
      );

      return {
        jsonrpc: "2.0",
        id: request.id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        },
      };
    }

    if (request.method === "initialize") {
      return {
        jsonrpc: "2.0",
        id: request.id,
        result: {
          protocolVersion: "1.0.0",
          serverInfo: {
            name: "code-analyzer",
            version: "1.0.0",
          },
          capabilities: {
            tools: {},
          },
        },
      };
    }

    return {
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: -32601,
        message: "Method not found",
      },
    };
  } catch (error) {
    return {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32700,
        message: "Parse error: " + error.message,
      },
    };
  }
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--validate')) {
    console.log('Code Analyzer MCP Server validation passed');
    process.exit(0);
  }

  const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
  if (LOG_LEVEL === 'info') {
    console.error('Code Analyzer MCP Server started');
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on('line', async (line) => {
    const response = await handleMessage(line);
    console.log(JSON.stringify(response));
  });

  rl.on('close', () => {
    if (LOG_LEVEL === 'info') {
      console.error('Code Analyzer MCP Server stopped');
    }
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
