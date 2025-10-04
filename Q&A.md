# Q&A - Protobooth Development Decisions

This document captures key architectural and implementation questions with recommended answers based on protobooth's core principles.

## Core Principles (Always Consider First)

1. **Test-Driven Development** - Write tests BEFORE implementation (RED → GREEN → REFACTOR)
2. **Simplicity First** - Always choose the simplest solution
3. **SOLID Principles** - Apply consistently during planning and implementation
4. **201-Line Limit** - Keep all `.ts`, `.tsx`, `.css`, `.scss` files under 201 lines
5. **TestIds Only** - NEVER use text-based queries in tests, ALWAYS use `data-testid`
6. **Zero `any` Types** - Maintain strict TypeScript type safety

---

## Current Implementation Questions (Session 4 - October 2025)

### Q1: UI-to-API Connection Strategy

**Context**: The UIs (ResolveApp, AnnotateApp) currently receive service functions as props (mocks in tests). For production browser usage, we need client-side implementations that call our API endpoints.

**Question**: How should we connect the browser-based UIs to the HTTP API endpoints?

**Recommended Answer**: **Create browser-side API adapter layer** following dependency injection pattern.

**Rationale**:
- **Maintains testability** - UIs remain testable with mocks
- **Single Responsibility** - UI components don't know about HTTP
- **Simplicity** - Clean abstraction boundary
- **Follows existing pattern** - Already using props for dependency injection

**Implementation Approach**:

```typescript
// src/ui/browser-api-adapter.ts (under 201 lines)
export function createBrowserFileOperations(baseUrl: string): FileOperations {
  return {
    async readFile(filename: string): Promise<string> {
      const response = await fetch(`${baseUrl}/api/files/${filename}`);
      if (!response.ok) throw new Error('File not found');
      return response.text();
    },
    async writeFile(filename: string, content: string): Promise<void> {
      await fetch(`${baseUrl}/api/files/${filename}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
    },
    async fileExists(filename: string): Promise<boolean> {
      const response = await fetch(`${baseUrl}/api/files/${filename}`, { method: 'HEAD' });
      return response.ok;
    }
  };
}

export function createBrowserScreenshotService(baseUrl: string): ScreenshotService {
  return {
    async captureRoutes(options: CaptureOptions): Promise<CaptureResult> {
      const response = await fetch(`${baseUrl}/api/screenshots/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      return response.json();
    }
  };
}
```

**TDD Approach**:
1. **RED**: Write tests for browser adapters (mock fetch API)
2. **GREEN**: Implement minimal adapter functions
3. **REFACTOR**: Extract common patterns if duplication emerges

**File Size**: All adapters in single file (estimated ~80 lines), well under 201-line limit.

---

### Q2: Testing Strategy for E2E Workflows

**Context**: We have integration tests for API handlers. Now need to test complete user workflows.

**Question**: What testing strategy should we use for end-to-end workflow validation?

**Recommended Answer**: **Hybrid approach - Option C (Both integration and E2E tests)**.

**Rationale**:
- **Integration tests** (current) - Fast, reliable, test API layer
- **E2E tests** (new) - Validate complete workflow with real HTTP
- **Best of both worlds** - Fast feedback + high confidence

**Test Pyramid**:
```
         ╱╲     E2E Tests (5-10)
        ╱  ╲    - Full workflow with real dev server
       ╱    ╲   - Slower but comprehensive
      ╱──────╲
     ╱        ╲  Integration Tests (30-40)
    ╱          ╲ - API handlers with real services
   ╱────────────╲ - Fast, focused
  ╱              ╲ Unit Tests (100+)
 ╱────────────────╲ - Component logic
```

**Implementation Approach**:

**Integration Tests** (current - keep these):
- Test API handlers directly without HTTP
- Use mock request/response objects
- Fast execution (~50ms per test)
- Already have 12 tests covering all endpoints

**E2E Tests** (new - add these):
```typescript
// tests/e2e/request-review-workflow.test.ts
describe('Request Review Workflow - End to End', () => {
  it('should complete full workflow from UI to file storage', async () => {
    // 1. Start dev server
    // 2. Navigate to /protobooth/resolve
    // 3. Click "Request Review" button
    // 4. Verify API call made
    // 5. Verify workflow state updated in .protobooth/ directory
    // 6. Verify screenshots captured
  });
});
```

**TDD Approach**:
1. **RED**: Write failing E2E tests for complete workflows
2. **GREEN**: Connect UIs to browser adapters
3. **REFACTOR**: Optimize test setup/teardown

**Scope**: 5-10 E2E tests covering critical paths:
- Request Review workflow
- Annotation download workflow
- Workflow state persistence
- Error recovery

---

### Q3: Implementation Priority

**Context**: Multiple possible next steps - need to choose optimal sequence.

**Question**: What order should we implement remaining features?

**Recommended Answer**: **Option A - Complete Vite workflow first, then replicate for Next.js**.

**Rationale**:
- **Faster feedback** - Get one framework fully working quickly
- **Validates architecture** - Proves the design before replicating
- **Simplicity** - Focus on one framework at a time
- **Demo-driven** - Can test with demos/tanstack-router immediately

**Implementation Sequence**:

**Phase 1: Browser API Adapters** (TDD)
1. Write tests for browser file operations adapter
2. Write tests for browser screenshot service adapter
3. Write tests for browser workflow manager adapter
4. Implement all adapters (single file, ~100 lines)
5. Verify adapters work with existing API endpoints

**Phase 2: Connect ResolveApp to Browser Adapters**
1. Update resolve-dev.tsx to use browser adapters
2. Test locally with Vite demo app
3. Verify "Request Review" button triggers real screenshot capture
4. Verify workflow state persists to .protobooth/

**Phase 3: Connect AnnotateApp to Browser Adapters**
1. Update annotate-dev.tsx to use browser adapters
2. Test locally with Vite demo app
3. Verify annotations save to .protobooth/
4. Verify "Publish" button works end-to-end

**Phase 4: E2E Tests for Vite**
1. Write E2E tests for complete Request Review workflow
2. Write E2E tests for complete annotation workflow
3. Verify all tests pass with real dev server

**Phase 5: Replicate for Next.js**
1. Create Next.js versions of browser adapters (if needed)
2. Test with demos/nextjs app
3. Verify feature parity with Vite
4. Add Next.js-specific E2E tests

**Phase 6: Download Mechanism**
1. Implement .zip generation endpoint
2. Add download handler to ResolveApp
3. Test download workflow E2E

**Estimated Timeline**: Phase 1-4 (Vite complete) = 1-2 sessions, Phase 5-6 (Next.js + downloads) = 1 session

---

### Q4: Download Mechanism Scope

**Context**: Need to implement annotation download as .zip file.

**Question**: What should the download endpoint include?

**Recommended Answer**: **Generate .zip on-the-fly with annotations JSON + original screenshots**.

**Rationale**:
- **Simplicity** - On-the-fly generation, no storage overhead
- **Complete package** - Developers get everything needed
- **Visual context** - Screenshots help understand annotations
- **No database** - Consistent with file-based architecture

**Download Contents**:
```
protobooth-annotations-{timestamp}.zip
├── annotations.json          # All annotation data
├── screenshots/
│   ├── home-desktop.png      # Original screenshots
│   ├── home-mobile.png
│   ├── about-desktop.png
│   └── ...
└── README.txt               # Simple explanation of contents
```

**Implementation Approach**:

```typescript
// src/api/download-handler.ts (under 201 lines)
export async function handleAnnotationDownload(
  projectRoot: string
): Promise<Buffer> {
  const zip = new JSZip(); // or Node's built-in zlib

  // Add annotations JSON
  const annotations = await readFile('.protobooth/annotations.json');
  zip.file('annotations.json', annotations);

  // Add screenshots
  const screenshots = await readdir('.protobooth/screenshots');
  for (const file of screenshots) {
    const content = await readFile(`.protobooth/screenshots/${file}`);
    zip.file(`screenshots/${file}`, content);
  }

  // Add README
  zip.file('README.txt', 'Protobooth Annotation Export...');

  return zip.generateAsync({ type: 'nodebuffer' });
}
```

**API Endpoint**:
- `GET /api/annotations/download` → Returns .zip file
- Content-Type: `application/zip`
- Content-Disposition: `attachment; filename="protobooth-annotations-{timestamp}.zip"`

**TDD Approach**:
1. **RED**: Write test for download endpoint
2. **GREEN**: Implement zip generation
3. **REFACTOR**: Extract zip logic if needed

**Alternative Considered (Rejected)**: Include annotated screenshots with markup overlays
- **Reason for rejection**: Adds complexity, original screenshots are sufficient
- **Could add later**: If clients specifically request it

---

### Q5: Immediate Next Step

**Context**: Multiple tasks ready to start.

**Question**: What should we work on right now?

**Recommended Answer**: **Option B - Write E2E workflow tests first (TDD approach)**.

**Rationale**:
- **True TDD** - Write tests before browser adapters
- **Defines requirements** - Tests specify exactly what adapters need
- **Higher confidence** - Validates complete user workflow
- **Aligns with principles** - RED → GREEN → REFACTOR

**Immediate Action Plan**:

**Step 1: Write Failing E2E Test for Request Review** (RED phase)
```typescript
// tests/e2e/request-review-e2e.test.ts (NEW FILE)
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, Page } from 'playwright';

describe('Request Review Workflow - End to End', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    // Start Vite dev server programmatically
    // Wait for server to be ready
    browser = await chromium.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
    // Stop dev server
  });

  it('should capture screenshots when Request Review clicked', async () => {
    // Navigate to /protobooth/resolve
    await page.goto('http://localhost:5173/protobooth/resolve');

    // Wait for UI to load
    await page.waitForSelector('[data-testid="request-review-button"]');

    // Click Request Review
    await page.click('[data-testid="request-review-button"]');

    // Wait for capture to complete
    await page.waitForSelector('[data-testid="workflow-reviews-requested"]');

    // Verify workflow state was updated
    const fs = await import('fs/promises');
    const stateFile = await fs.readFile('.protobooth/workflow-state.json', 'utf-8');
    const state = JSON.parse(stateFile);
    expect(state.state).toBe('reviews-requested');

    // Verify screenshots were created
    const screenshots = await fs.readdir('.protobooth/screenshots');
    expect(screenshots.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run Test - It WILL Fail** (confirming RED phase)
- Test will fail because browser adapters don't exist yet
- This is expected and correct per TDD

**Step 3: Create Browser Adapters** (GREEN phase)
- Implement createBrowserFileOperations()
- Implement createBrowserScreenshotService()
- Wire adapters into resolve-dev.tsx
- Run test again - should pass

**Step 4: Refactor If Needed** (REFACTOR phase)
- Extract common patterns
- Improve error handling
- Maintain test pass rate

**Estimated Time**:
- E2E test writing: 30-60 minutes
- Browser adapter implementation: 60-90 minutes
- Total: ~2-3 hours to complete full TDD cycle

---

## Decision Summary

Based on core principles and current project state:

1. **UI-API Connection**: Create browser adapter layer (simplicity, testability)
2. **Testing Strategy**: Hybrid (integration + E2E tests)
3. **Implementation Priority**: Vite first, then Next.js (faster feedback)
4. **Download Scope**: .zip with JSON + original screenshots (simplicity)
5. **Immediate Next Step**: Write E2E tests first (true TDD)

All decisions prioritize:
- ✅ Test-first development
- ✅ Simplicity over cleverness
- ✅ SOLID principles
- ✅ 201-line file limit
- ✅ Zero `any` types
- ✅ Testable architecture

---

## Follow-Up Questions - ANSWERED

All strategic questions resolved:

1. ✅ **E2E test approach approved** - Write failing E2E tests first (TDD)
2. ✅ **Browser adapter architecture approved** - Single file with all adapters
3. ✅ **Vite-first approach approved** - Complete Vite before Next.js
4. ✅ **Download format approved** - .zip with JSON + screenshots
5. ✅ **Dev server management** - Start once per test file, random port (see Q6 below)
6. ✅ **Test fixtures for E2E** - Use demos/tanstack-router app (see Q7 below)

---

### Q6: E2E Test Dev Server Management

**Context**: E2E tests need a running Vite dev server to test against.

**Question**: How should E2E tests start/stop the Vite dev server?

**Recommended Answer**: **Start dev server once per test file (beforeAll), use random available port**.

**Rationale**:
- **Good UX** - Developers just run `npm test`, no manual server management
- **Fast** - Server starts once, shared across tests in same file
- **Isolated** - Each test file gets its own server instance
- **No port conflicts** - Random port prevents collision with already-running dev servers
- **Automatic cleanup** - Server stops in afterAll

**Implementation**:

```typescript
// tests/e2e/request-review-e2e.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, Page } from 'playwright';
import { createServer, ViteDevServer } from 'vite';
import { resolve } from 'path';

describe('Request Review Workflow - End to End', () => {
  let server: ViteDevServer;
  let browser: Browser;
  let page: Page;
  let serverUrl: string;

  beforeAll(async () => {
    // Start Vite dev server for demos/tanstack-router
    server = await createServer({
      root: resolve(__dirname, '../../demos/tanstack-router'),
      server: {
        port: 0, // 0 = random available port
      },
    });

    await server.listen();
    const port = server.config.server.port!;
    serverUrl = `http://localhost:${port}`;

    // Start Playwright browser
    browser = await chromium.launch();
    page = await browser.newPage();
  }, 60000); // 60 second timeout for server startup

  afterAll(async () => {
    await page?.close();
    await browser?.close();
    await server?.close();
  });

  it('should capture screenshots when Request Review clicked', async () => {
    // Navigate to protobooth resolve UI
    await page.goto(`${serverUrl}/protobooth/resolve`);

    // Test continues...
  });
});
```

**Benefits**:
- ✅ Zero manual setup - tests are self-contained
- ✅ No port conflicts - random port allocation
- ✅ Fast - server shared across tests in file
- ✅ Clean - automatic teardown

**Alternative Considered (Rejected)**: Assume server already running manually
- **Reason**: Poor developer experience - easy to forget, tests fail mysteriously
- **Better**: Automated setup, tests "just work"

---

### Q7: E2E Test Fixtures and Target App

**Context**: E2E tests need a real application to test protobooth integration.

**Question**: Which demo app should E2E tests use, and how?

**Confirmed Answer**: **Use `demos/tanstack-router` as primary E2E test target**.

**Rationale**:
- **Primary integration** - TanStack Router is the main focus
- **Real-world validation** - Tests against actual router implementation
- **Complete setup** - Demo already has fixtures, routes, components
- **Vite-first approach** - Aligns with implementation priority

**E2E Test Structure**:

```typescript
// tests/e2e/request-review-e2e.test.ts
describe('Request Review Workflow - TanStack Router Demo', () => {
  // Uses demos/tanstack-router app
  // Tests protobooth routes: /protobooth/resolve, /protobooth/annotate
  // Verifies integration with real TanStack Router routes
});

// tests/e2e/annotation-workflow-e2e.test.ts
describe('Annotation Workflow - TanStack Router Demo', () => {
  // Tests complete annotation cycle
  // Verifies file persistence in .protobooth/ directory
});
```

**Demo App Routes Available** (from `demos/tanstack-router/routes.json`):
- Static routes: `/`, `/about`, `/dashboard`, `/products`
- Dynamic routes: `/product/$slug`, `/user/$userId`
- Total: 6 routes for comprehensive testing

**Test Scenarios**:
1. Navigate to `/protobooth/resolve`
2. Click "Request Review" button
3. Verify screenshots captured for all 6 demo routes
4. Verify workflow state persisted to `.protobooth/workflow-state.json`
5. Navigate to `/protobooth/annotate` (simulating staging)
6. Add annotations to screenshots
7. Click "Publish" button
8. Verify annotations saved to `.protobooth/annotations.json`

**Benefits**:
- ✅ Real integration testing - not mocked
- ✅ Uses existing demo infrastructure
- ✅ Validates complete workflow end-to-end
- ✅ Tests actual fixture injection with TanStack Router

---

## Implementation Plan - Ready to Execute

With all questions answered, the implementation plan is:

**Phase 1: E2E Tests (RED)**
1. Create `tests/e2e/request-review-e2e.test.ts`
2. Write failing test for Request Review workflow
3. Test will fail because browser adapters don't exist yet ✅ (expected)

**Phase 2: Browser Adapters (GREEN)**
1. Create `src/ui/browser-api-adapter.ts`
2. Implement `createBrowserFileOperations()`
3. Implement `createBrowserScreenshotService()`
4. Wire adapters into `src/ui/Resolve/index.tsx`
5. E2E test should pass ✅

**Phase 3: Manual Verification**
1. Run demo: `cd demos/tanstack-router && npm run dev`
2. Navigate to `http://localhost:5173/protobooth/resolve`
3. Click "Request Review" button
4. Verify screenshots captured in `.protobooth/screenshots/`
5. Verify workflow state in `.protobooth/workflow-state.json`

**Phase 4: Repeat for AnnotateApp**
1. Write E2E test for annotation workflow (RED)
2. Wire browser adapters into `src/ui/Annotate/index.tsx` (GREEN)
3. Test annotation save/publish workflow

**Estimated Timeline**: 2-3 hours for complete Vite workflow

All decisions align with core principles. Ready to proceed with TDD cycle.
