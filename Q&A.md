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

## Architecture & Workflow Questions

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

### Q8: Annotation Upload Mechanism (UX Step 5h)

**Context**: UX.PROCESS.md step 5h states "Engineers upload the `.protobooth` assets from the previous step via the resolve UI". This implies a file upload interface in development.

**Question**: How should engineers upload downloaded annotation .zip files back into their development environment?

**Recommended Answer**: **No upload needed - use file-based workflow with .protobooth directory**.

**Rationale**:
- **Simplicity** - Avoid complexity of file upload UI
- **Git-friendly** - .protobooth directory can be git-ignored and manually synced
- **Developer workflow** - Developers can extract .zip directly to project root
- **Zero dependencies** - No need for file upload libraries

**Implementation Approach**:

**Developer Workflow**:
1. Download `protobooth-annotations-{timestamp}.zip` from staging
2. Extract to project root (overwrites `.protobooth/` directory)
3. ResolveApp automatically detects new annotations via file operations
4. Workflow state updates to "submitted-for-development"

**No UI Changes Required**:
- ResolveApp already reads from `.protobooth/annotations.json`
- No upload button needed
- Simple file copy/paste workflow

**Alternative Considered (Rejected)**: Browser-based file upload
- **Reason**: Adds complexity for minimal benefit
- **Developer preference**: File operations more familiar than upload forms

**TDD Approach**: No new tests needed - existing file operation tests cover this.

---

### Q9: Annotation Readiness Communication (UX Step 5f)

**Context**: UX.PROCESS.md step 5f states "It is somehow communicated to the engineers that annotations are ready". Current implementation has no notification mechanism.

**Question**: How should engineers be notified when client annotations are ready?

**Recommended Answer**: **Manual polling - engineers check staging periodically** (simplest approach for v1).

**Rationale**:
- **Simplicity** - No infrastructure needed
- **Low frequency** - Prototype reviews happen every few days, not minutes
- **Manual coordination** - Engineers and clients already communicate via email/Slack
- **YAGNI** - Automated notifications add complexity without clear value

**v1 Implementation (Current)**:
- Engineers manually check staging URL periodically
- Client sends email/Slack when annotations published
- Engineers download .zip when notified

**Future Enhancements (Optional)**:
- **Email notification** - Server sends email when "Publish" clicked (requires email service)
- **Webhook** - POST to configured URL when annotations published (simple, no email deps)
- **Polling indicator** - ResolveApp shows "Check for Updates" button that queries staging API

**Recommended Next Step**: Ship v1 with manual coordination, add webhook if clients request it.

**TDD Approach**: No implementation needed for v1 (manual process).

---

### Q10: Client UX - "Dead-Simple" Annotation Interface

**Context**: UX.PROCESS.md prioritizes "dead-simple" client experience. Current AnnotateApp design needs validation.

**Question**: What specific UX patterns ensure the annotation interface is "dead-simple" for non-technical clients?

**Recommended Answer**: **Minimize UI elements, maximize visual clarity**.

**Required UX Patterns**:

1. **Single Primary Action**
   - One clear "Publish" button when done
   - No confusing save/submit/export options

2. **Visual Feedback**
   - Highlight which screenshot is active
   - Show count of annotations added
   - Clear indication when annotation saved

3. **Minimal Annotation Tools**
   - Simple text comments only (v1)
   - Optional: Arrow/box tools (v2)
   - NO complex markup features

4. **Clear Navigation**
   - Previous/Next buttons for screenshots
   - Thumbnail sidebar for quick access
   - Current position indicator (e.g., "3 of 12")

5. **Error Prevention**
   - Confirm before leaving with unsaved annotations
   - Auto-save annotations as they're created
   - Clear "saved" indicator

**Current Implementation Status**:
- ✅ Single "Publish" button exists
- ✅ Screenshot navigation implemented
- ✅ Simple text-based annotations
- ⏳ Missing: Visual feedback for annotation count
- ⏳ Missing: Auto-save functionality

**Next Steps**: Add auto-save and visual feedback in future UI refinement pass.

---

### Q11: Cleanup Command Safety

**Context**: UX.PROCESS.md step 6 mentions "cleanup command". Need to define scope and safety measures.

**Question**: What should `npx protobooth cleanup` do, and what safety measures prevent accidental data loss?

**Recommended Answer**: **Remove protobooth files with confirmation prompt and backup option**.

**Recommended Scope**:

**Files to Remove**:
- `.protobooth/` directory (all screenshots, annotations, workflow state)
- `routes.json` (generated by route discovery)
- Injected routes from router configuration
- Plugin configuration from vite.config.ts / next.config.js

**Files to Preserve**:
- Application source code (obviously)
- Git history
- node_modules (uninstall is separate step)

**Safety Measures**:

1. **Confirmation Prompt**
   ```bash
   $ npx protobooth cleanup
   ⚠️  This will permanently delete:
     - .protobooth/ directory (screenshots, annotations)
     - routes.json
     - Protobooth plugin configuration

   Create backup before cleanup? (Y/n): y
   Proceed with cleanup? (y/N): y
   ```

2. **Automatic Backup**
   - Create `.protobooth-backup-{timestamp}.zip` before deletion
   - Store in project root
   - Include README explaining backup contents

3. **Dry-run Option**
   ```bash
   $ npx protobooth cleanup --dry-run
   Would delete:
     - .protobooth/
     - routes.json
     - Plugin config in vite.config.ts
   ```

**Implementation**:
```typescript
// src/cli/cleanup.ts (under 201 lines)
export async function cleanup(options: { dryRun?: boolean; backup?: boolean }) {
  if (options.backup) {
    await createBackup();
  }

  if (options.dryRun) {
    console.log('Would delete: .protobooth/, routes.json');
    return;
  }

  const confirmed = await promptConfirm('Proceed with cleanup?');
  if (!confirmed) return;

  await removeDirectory('.protobooth');
  await removeFile('routes.json');
  await removePluginConfig();

  console.log('✅ Cleanup complete. Backup saved to .protobooth-backup-{timestamp}.zip');
}
```

**TDD Approach**:
1. **RED**: Write tests for cleanup command
2. **GREEN**: Implement with safety measures
3. **REFACTOR**: Extract backup logic if needed

---

### Q12: Staging Deployment Strategy

**Context**: UX.PROCESS.md step 5d mentions "deployment to staging occurs (manual or automatic)". Need to clarify approach.

**Question**: Should protobooth provide deployment automation, or rely on manual/existing CI/CD?

**Recommended Answer**: **Manual deployment (v1) - rely on existing workflows**.

**Rationale**:
- **Simplicity** - Don't reinvent deployment infrastructure
- **Flexibility** - Every team has different staging setups
- **Separation of concerns** - Protobooth handles screenshots/annotations, not deployment
- **No lock-in** - Works with any deployment method

**v1 Approach (Recommended)**:

**Manual Deployment**:
```bash
# After "Request Review" completes
$ ls .protobooth/screenshots/
home-desktop.png  about-mobile.png  ...

# Deploy using existing method
$ rsync -av .protobooth/ user@staging:/var/www/protobooth/
# OR
$ git add .protobooth/ && git push staging
# OR
$ scp -r .protobooth/ staging:/var/www/
```

**What Protobooth Provides**:
- ✅ Generate screenshots in `.protobooth/` directory
- ✅ Provide deployment instructions in UI
- ❌ NO automated deployment (too many variables)

**Deployment Instructions UI**:
```typescript
// After screenshot capture completes
<DeploymentInstructions>
  <h3>Screenshots Ready</h3>
  <p>12 screenshots captured in .protobooth/screenshots/</p>

  <h4>Deploy to Staging</h4>
  <CodeBlock>
    rsync -av .protobooth/ user@staging:/var/www/
  </CodeBlock>

  <p>Or use your existing deployment process.</p>
</DeploymentInstructions>
```

**Future Enhancement (Optional)**:
- Plugin hooks for custom deployment (e.g., `onScreenshotComplete` callback)
- Example integrations for common platforms (Vercel, Netlify)

**Current Status**: DeploymentInstructions component already exists and shows manual deployment guidance.

**TDD Approach**: No new implementation needed - manual process documented in UI.

---

## Decision Summary

Based on core principles and UX.PROCESS.md requirements:

1. **UI-API Connection**: Browser adapter layer (Q1)
2. **Testing Strategy**: Hybrid integration + E2E (Q2)
3. **Implementation Priority**: Vite first, then Next.js (Q3)
4. **Download Scope**: .zip with JSON + screenshots (Q4)
5. **E2E Testing**: Write tests first, use demos (Q5-Q7)
6. **Annotation Upload**: File-based, no UI upload needed (Q8)
7. **Communication**: Manual polling for v1 (Q9)
8. **Client UX**: Minimal UI, clear feedback (Q10)
9. **Cleanup Safety**: Confirmation + backup (Q11)
10. **Deployment**: Manual via existing workflows (Q12)

All decisions prioritize:
- ✅ Test-first development
- ✅ Simplicity over cleverness
- ✅ SOLID principles
- ✅ 201-line file limit
- ✅ Zero `any` types
- ✅ User experience (client-first, engineer-second)
