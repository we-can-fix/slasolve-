# SLASolve - GitHub Copilot Custom Instructions

## 📋 Project Overview

**Project Name:** SLASolve  
**Goal:** Auto-Fix Bot – Intelligent Development Assistant for code analysis and automatic fixing, with SLSA provenance capabilities  
**Tech Stack:** TypeScript, Node.js, Express, Jest, Zod, Sigstore  
**License:** MIT

---

## 🎯 Code Style and Standards

### Language and Framework
- **Primary Language:** TypeScript (strict mode)
- **Backend Framework:** Express.js
- **Node Version:** >=18.0.0
- **Package Manager:** npm >=8.0.0
- **Validation:** Zod
- **Security:** Sigstore for signing and verification

### Code Conventions

#### TypeScript Configuration
```typescript
// ✅ TypeScript settings (already configured)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

#### Naming Conventions
- **File names:** kebab-case (e.g., `provenance.ts`, `slsa.ts`)
- **Class names:** PascalCase (e.g., `ProvenanceController`, `SLSAValidator`)
- **Function names:** camelCase (e.g., `validateProvenance()`, `verifySignature()`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **Private members:** Prefix with `_` (e.g., `_internalCache`, `_validateInput()`)

#### Code Format
- **Indentation:** 2 spaces
- **Line length:** Maximum 100 characters
- **Semicolons:** Required
- **Quotes:** Single quotes `'` preferred, double quotes `"` in JSX
- **Trailing commas:** Use (ES5 compatible)

```typescript
// ✅ Correct example
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
};

// ❌ Incorrect example
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3
}
```

### ESLint Rules
```javascript
// ESLint configuration
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-types": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error"
  }
}
```

---

## 🏗️ Architecture and Design Patterns

### Project Structure
```
slasolve/
├── .github/
│   ├── workflows/               # GitHub Actions
│   ├── copilot-instructions.md  # This file
│   └── dependabot.yml          # Dependency management
│
├── core/                        # Core platform services
│   └── contracts/              # Contract management services
│       └── contracts-L1/       # Layer 1 contract management
│           └── contracts/      # Core contract service implementation
│               ├── src/
│               │   ├── routes.ts          # Route definitions
│               │   ├── server.ts          # Main server
│               │   ├── controllers/       # Controllers
│               │   │   ├── provenance.ts  # Provenance logic
│               │   │   └── slsa.ts        # SLSA validation
│               │   └── middleware/        # Middleware
│               │       └── logging.ts     # Logging middleware
│               ├── dist/               # Compiled output
│               ├── package.json        # Dependencies
│               ├── tsconfig.json       # TypeScript config
│               └── jest.config.js      # Jest config
│
├── docs/                        # Documentation
├── mcp-servers/                # MCP server implementations
├── test-vectors/               # Test vectors
├── schemas/                    # Schema definitions
│
├── README.md                   # Project documentation
├── CONTRIBUTING.md            # Contribution guidelines
└── SECURITY.md                # Security policies
```

### Design Patterns

#### 1. Controller Pattern
```typescript
// ✅ Recommended: Use controller pattern for route handlers
export class ProvenanceController {
  async getProvenance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const provenance = await this.provenanceService.get(id);
      res.json(provenance);
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
```

#### 2. Middleware Pattern
```typescript
// ✅ Recommended: Use middleware for cross-cutting concerns
// Example: Realistic logging middleware with trace ID, timing, sanitization, and log levels
import { Request, Response, NextFunction } from 'express';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = process.hrtime.bigint();
  const traceId = req.headers['x-trace-id'] || req.id || 'unknown';
  // Simple request sanitization: omit sensitive headers
  const sanitizedHeaders = { ...req.headers };
  delete sanitizedHeaders['authorization'];

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    logger.info({
      traceId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs,
      headers: sanitizedHeaders,
    }, 'Request completed');
  });
  next();
};
```

#### 3. Validation with Zod
```typescript
// ✅ Recommended: Use Zod for input validation
import { z } from 'zod';

const provenanceSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  signature: z.string(),
});

type Provenance = z.infer<typeof provenanceSchema>;
```

---

## 📝 Documentation and Comments

### JSDoc Comments
```typescript
/**
 * Validates SLSA provenance for a given artifact
 * 
 * @param artifactId - Unique identifier of the artifact
 * @param provenance - Provenance data to validate
 * @returns Validation result with details
 * @throws {ValidationError} When provenance is invalid
 * 
 * @example
 * const result = await validateProvenance('artifact-001', provenanceData);
 */
async validateProvenance(
  artifactId: string,
  provenance: Provenance
): Promise<ValidationResult> {
  // Implementation
}
```

### Class and Interface Documentation
```typescript
/**
 * SLSA provenance validator
 * 
 * Validates artifacts against SLSA framework requirements.
 * Supports multiple SLSA levels and custom validation rules.
 * 
 * @class
 * @example
 * const validator = new SLSAValidator();
 * const result = await validator.validate(artifact);
 */
class SLSAValidator {
  // Implementation
}

/**
 * Validation result interface
 * 
 * @interface
 */
interface ValidationResult {
  /** Whether validation passed */
  passed: boolean;
  /** Validation details */
  details: string;
  /** Issues found during validation */
  issues: ValidationIssue[];
}
```

---

## 🧪 Testing Standards

### Test Structure
```typescript
// ✅ Recommended test structure
describe('ProvenanceController', () => {
  let controller: ProvenanceController;
  let mockService: jest.Mocked<ProvenanceService>;

  beforeEach(() => {
    mockService = createMockService();
    controller = new ProvenanceController(mockService);
  });

  describe('getProvenance', () => {
    it('should return provenance for valid id', async () => {
      // Arrange
      const id = 'test-id';
      const expected = { id, data: 'test' };
      mockService.get.mockResolvedValue(expected);

      // Act
      const result = await controller.getProvenance(id);

      // Assert
      expect(result).toEqual(expected);
      expect(mockService.get).toHaveBeenCalledWith(id);
    });

    it('should throw error for non-existent id', async () => {
      // Arrange
      const id = 'non-existent';
      mockService.get.mockRejectedValue(new NotFoundError());

      // Act & Assert
      await expect(controller.getProvenance(id)).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
```

### Test Coverage
- **Minimum coverage:** 80%
- **Critical paths:** 100%
- **Error handling:** 100%

---

## 🔒 Security Best Practices

### Environment Variables
```typescript
// ✅ Recommended: Use environment variables for sensitive data
import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true',
  },
  sigstore: {
    verifyUrl: process.env.SIGSTORE_VERIFY_URL,
  },
};

// ❌ Avoid: Hard-coded sensitive information
const config = {
  database: {
    url: 'postgresql://user:password@localhost:5432/db',
  },
};
```

### Input Validation
```typescript
// ✅ Recommended: Validate all user input
import { z } from 'zod';

const artifactSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
});

async function processArtifact(input: unknown): Promise<Result> {
  const validated = artifactSchema.parse(input);
  // Use validated data
}
```

### Error Handling
```typescript
// ✅ Recommended: Proper error handling and logging
class ProvenanceService {
  async validate(id: string): Promise<Result> {
    try {
      console.log(`Validating provenance: ${id}`);
      const result = await this.performValidation(id);
      console.log(`Validation successful: ${id}`);
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) {
        console.warn(`Provenance not found: ${id}`);
        throw error;
      }
      
      console.error('Unexpected validation error', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ValidationError('Failed to validate provenance');
    }
  }
}
```

---

## 📦 Dependency Management

### Key Dependencies
```json
{
  "dependencies": {
    "express": "^4.21.2",
    "typescript": "^5.3.2",
    "zod": "^3.22.4",
    "@sigstore/sign": "^2.2.0",
    "@sigstore/verify": "^1.0.0",
    "helmet": "^7.2.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/node": "^20.19.25",
    "@types/express": "^4.17.25",
    "@typescript-eslint/eslint-plugin": "^6.12.0",
    "@typescript-eslint/parser": "^6.12.0",
    "eslint": "^8.54.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1"
  }
}
```

---

## 🚀 Git Workflow

### Branch Naming
- **Feature branches:** `feature/description` (e.g., `feature/slsa-validator`)
- **Fix branches:** `fix/description` (e.g., `fix/provenance-validation`)
- **Docs branches:** `docs/description` (e.g., `docs/api-reference`)
- **Release branches:** `release/version` (e.g., `release/1.0.0`)

### Commit Messages (Conventional Commits)
```
<type>(<scope>): <subject>

<body>

<footer>

# Types:
# feat: New feature
# fix: Bug fix
# docs: Documentation
# style: Code style
# refactor: Refactoring
# perf: Performance
# test: Tests
# chore: Build or dependencies

# Example:
feat(provenance): add SLSA Level 3 validation

Implement comprehensive validation for SLSA Level 3 compliance.
Includes signature verification and metadata validation.

Closes #123
```

### Pull Request Checklist
- [ ] Code follows style guide
- [ ] Tests added and passing
- [ ] Test coverage ≥ 80%
- [ ] Documentation updated
- [ ] Clear commit messages
- [ ] No hard-coded sensitive information
- [ ] All CI checks pass

---

## 🔄 CI/CD

### GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

---

## 💡 General Guidelines

### When generating code:
1. ✅ Prioritize TypeScript and type safety
2. ✅ Follow architecture and naming conventions above
3. ✅ Include complete JSDoc comments
4. ✅ Add appropriate error handling
5. ✅ Consider performance and scalability
6. ✅ Write unit tests
7. ✅ Use Zod for validation
8. ✅ Follow security best practices

### When answering questions:
1. ✅ Provide specific code examples
2. ✅ Explain why it's best practice
3. ✅ Point out common pitfalls
4. ✅ Provide alternatives when relevant
5. ✅ Link to relevant documentation

---

## 📚 Useful Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Jest Testing Framework](https://jestjs.io/)
- [Zod Validation](https://zod.dev/)
- [SLSA Framework](https://slsa.dev/)
- [Sigstore Documentation](https://docs.sigstore.dev/)

---

## 🎯 Project-Specific Guidance

### SLASolve Core Features

#### Provenance Management
- SLSA compliance validation
- Signature verification with Sigstore
- Provenance data storage and retrieval

#### Contract Management
- L1 contract service implementation
- RESTful API for contract operations
- Secure contract validation

#### Security Features
- Helmet for security headers
- CORS configuration
- Input validation with Zod
- Sigstore integration for signing

---

**Last Updated:** November 2025  
**Maintainer:** SLASolve Team
