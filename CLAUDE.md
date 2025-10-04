# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Documentation

- **CLAUDE.md** (this file) - Comprehensive technical guidance and architectural decisions for Claude Code
- **PROGRESS.README.md** - Development progress tracking across Claude Code sessions with implementation roadmap
- **README.md** - User-facing project description and quick start guide for attracting developers
- **about.md** - Original project concept and design principles
- **architecture.md** - Detailed technical architecture and system design
- **dependencies.md** - Simplified dependency requirements and removed complexities

## Project Overview

**protobooth** is a disposable development tool for bridging the gap between generated frontend prototypes and client review processes. It's designed as an npm package targeting React applications with TypeScript, intended for the prototyping phase only with a "self-destruct" capability.

## Core Architecture Principles

**CRITICAL**: These principles must be considered at the start of every session and when generating any code:

1. **Test-Driven Development**: Write tests BEFORE implementation for all components. This is mandatory.
2. **Simplicity First**: Always keep things as simple as possible. Complexity can be added later.
3. **SOLID Principles**: Apply SOLID design principles consistently, even during planning phases.
4. **File Size Limits**: Keep all `.ts`, `.tsx`, `.css`, `.scss` files under 201 lines for maintainability and readability.
5. **ALWAYS Use TestIds for Testing - NON-NEGOTIABLE**:
   - NEVER use `getByText`, `getByRole` with text, or ANY text-based queries in tests
   - ALWAYS use `data-testid` attributes and `getByTestId` for ALL test queries
   - This is a MANDATORY rule - text-based queries are FORBIDDEN
   - See "Testing Best Practices - CRITICAL" section below for detailed rationale and examples
6. **TypeScript Strict Mode - NO `any` TYPES ALLOWED**:
   - NEVER use `any` types - this is a MANDATORY rule
   - ALWAYS create proper interfaces and type definitions
   - Leverage existing package types (Playwright, Fabric.js, etc.)
   - Use `unknown` if type is truly unknown, then narrow with type guards
   - Strict type safety is non-negotiable across the entire codebase

## System Architecture

### Environment Separation
- **Development Environment**: Developer Resolution UI accessible via `/protobooth` routes
- **Staging Environment**: Client-facing Annotation UI deployed to staging server
- **Staging Server Requirement**: Clients cannot access development environment directly

### 4-State Workflow
1. **In Development** - Developers work with fixture-defined mock data in local environment
2. **Reviews Requested** - Screenshots captured using fixtures and deployed to staging server
3. **In Review** - Clients access annotation UI on staging server to provide feedback
4. **Submitted For Development** - Developers download annotation data from staging back to development

## Automatic Route Discovery with Mock Data Fixtures

### Route Detection
- Automatically discovers all application routes from router configuration
- **Vite**: Parses `@tanstack/react-router` file-based route structure
- **Next.js**: Extracts routes from app/ directory structure (App Router - modern, recommended)
  - Legacy pages/ directory support maintained for backward compatibility
- Excludes `/protobooth/*` routes automatically
- Screenshots triggered only during "Reviews Requested" phase

### Fixtures for Consistent Data
- Provides mock authentication state for protected routes (injected into app context/localStorage)
- Supplies sample data for dynamic routes - users can provide arrays of fixture objects for multiple instances
- Ensures consistent application state across all screenshots
- Similar to test fixtures but focused on screenshot capture with mock data (no real authentication)

### Configuration Example
```typescript
// vite.config.ts or next.config.js
protobooth({
  enabled: process.env.NODE_ENV === 'development',
  fixtures: {
    auth: {
      user: { id: 1, name: 'John Doe', role: 'admin' },
      isAuthenticated: true,
      permissions: ['read', 'write']
    },
    dynamicRoutes: {
      // Single instance
      '/product/[slug]': { slug: 'sample-product' },
      // Multiple instances - array of fixture objects
      '/user/[id]': [
        { id: '123', name: 'John Doe' },
        { id: '456', name: 'Jane Smith' },
        { id: '789', name: 'Admin User' }
      ]
    },
    globalState: {
      theme: 'light',
      language: 'en',
      featureFlags: { newFeature: true }
    }
  },
  viewports: [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'desktop', width: 1440, height: 900 }
  ]
})
```

## UI Architecture Patterns

### Modular Design Philosophy
The UI is organized into three main modules following separation of concerns:

1. **Core Module** (`src/ui/Core/`): Shared functionality between both UIs
   - Components: Reusable UI components (Button, Layout, Sidebar, etc.)
   - Hooks: Custom React hooks used across both interfaces
   - Types: Shared TypeScript interfaces and types
   - Pattern: Each component has its own directory with props, variants, and exports

2. **Annotate Module** (`src/ui/Annotate/`): Client annotation interface
   - Components: Annotation-specific UI components
   - Hooks: Annotation workflow hooks
   - Types: Annotation-specific type definitions

3. **Resolve Module** (`src/ui/Resolve/`): Developer resolution interface
   - Components: Resolution workflow components
   - Hooks: Development workflow hooks
   - Types: Resolution-specific type definitions

4. **Global Directories**:
   - `state/`: Shared state management across both UIs
   - `styles/`: Organized SCSS with config, shared, and module-specific styles

### Component Module Pattern
Each UI component follows a consistent directory structure:
```
ComponentName/
├── ComponentName.tsx     # Main component implementation
├── [Variant].tsx         # Additional variants (BasicButton, etc.)
├── component.props.ts    # TypeScript prop definitions
└── index.ts             # Clean exports
```

### Style Organization
- `config/`: SCSS variables and configuration
- `shared/`: Common layouts and utilities
- `[module]-ui/`: Module-specific styles (annotate-ui, resolve-ui)
- Namespace all styles to prevent conflicts

## Core Components

### 1. Automatic Route Discovery
- Extracts route definitions from router configuration during build
- Handles static and dynamic route patterns
- Applies fixture data to dynamic routes for consistent screenshots

### 2. Screenshot Service
- Uses headless browser (Playwright/Puppeteer) for fixture-based capture
- Injects mock auth state into app context/localStorage before screenshots
- Processes arrays of fixtures for multiple instances of dynamic routes
- Multi-viewport screenshots at configured sizes
- Organizes screenshots by route and viewport on staging server

### 3. Fixture Management
- Mock authentication state for protected routes
- Dynamic route data for parameterized routes
- Global application state setup during screenshot capture
- Consistent data state across all screenshots

### 4. Staging Environment
- Client annotation interface with screenshot display
- Simple markup tools for feedback
- "Publish" UI button for clients to submit annotations
- JSON file storage for annotations (no database)
- No real-time sync - simple file-based storage

### 5. Development Environment
- Developer resolution interface with "Request Review" UI button
- HTTP client for downloading annotation data (.zip with JSON + marked-up screenshot images)
- Simple resolution tracking and workflow integration
- Git-ignored data directory for downloaded annotations

### 6. Simple File Storage
- JSON files for all data persistence
- No database or complex persistence layer
- Staging: Annotation storage as static files
- Development: Downloaded JSON files for resolution tracking

## File Structure

```
protobooth/
├── src/
│   ├── core/
│   │   ├── fixture-manager.ts        # Fixture-based route definitions
│   │   ├── workflow-engine.ts        # Simple state transitions
│   │   └── file-storage.ts           # JSON file operations
│   ├── screenshot/
│   │   ├── screenshot-capture-service.ts  # Screenshot capture with Playwright
│   │   ├── browser-controller.ts     # Browser automation interfaces
│   │   └── viewport-capture.ts       # Multi-viewport screenshot logic
│   ├── ui/                           # Modular UI architecture for maintainability
│   │   ├── Core/                     # Shared functionality between both UIs
│   │   │   ├── components/           # Reusable core components
│   │   │   │   ├── Layout.tsx        # Main layout wrapper
│   │   │   │   ├── Button/           # Button component module
│   │   │   │   │   ├── Button.tsx    # Main button component
│   │   │   │   │   ├── BasicButton.tsx # Basic variant
│   │   │   │   │   ├── button.props.ts # Button prop types
│   │   │   │   │   └── index.ts      # Module exports
│   │   │   │   ├── Sidebar/          # Sidebar component module
│   │   │   │   │   ├── Sidebar.tsx   # Main sidebar component
│   │   │   │   │   ├── SidebarSection.tsx # Sidebar section component
│   │   │   │   │   └── index.ts      # Module exports
│   │   │   │   ├── ToolbarStack/     # Toolbar component module
│   │   │   │   │   ├── ToolbarStack.tsx # Main toolbar stack
│   │   │   │   │   ├── Toolbar.tsx   # Individual toolbar
│   │   │   │   │   └── index.ts      # Module exports
│   │   │   │   ├── TextArea/         # TextArea component module
│   │   │   │   │   ├── TextArea.tsx  # Main textarea component
│   │   │   │   │   └── index.ts      # Module exports
│   │   │   │   └── index.ts          # Core components exports
│   │   │   ├── hooks/                # Shared custom hooks
│   │   │   │   └── index.ts          # Hook exports
│   │   │   └── types/                # Core UI type definitions
│   │   │       └── index.ts          # Type exports
│   │   ├── Annotate/                 # Annotation UI module
│   │   │   ├── components/           # Annotate-specific components
│   │   │   │   ├── AnnotateApp.tsx   # Main annotation interface
│   │   │   │   └── index.ts          # Annotate component exports
│   │   │   ├── hooks/                # Annotation-specific hooks
│   │   │   │   └── index.ts          # Hook exports
│   │   │   └── types/                # Annotation UI types
│   │   │       └── index.ts          # Type exports
│   │   ├── Resolve/                  # Resolution UI module
│   │   │   ├── components/           # Resolve-specific components
│   │   │   │   ├── ResolveApp.tsx    # Main resolution interface
│   │   │   │   └── index.ts          # Resolve component exports
│   │   │   ├── hooks/                # Resolution-specific hooks
│   │   │   │   └── index.ts          # Hook exports
│   │   │   └── types/                # Resolution UI types
│   │   │       └── index.ts          # Type exports
│   │   ├── state/                    # Global UI state management
│   │   │   └── agents.md             # State management patterns
│   │   └── styles/                   # Organized SCSS architecture
│   │       ├── config/               # SCSS configuration
│   │       │   ├── _vars.scss        # SCSS variables
│   │       │   └── _index.scss       # Config imports
│   │       ├── shared/               # Shared styles
│   │       │   ├── _layout.scss      # Layout utilities
│   │       │   └── index.scss        # Shared style imports
│   │       ├── annotate-ui/          # Annotation UI styles
│   │       │   └── index.scss        # Annotate-specific styles
│   │       └── resolve-ui/           # Resolution UI styles
│   │           └── index.scss        # Resolve-specific styles
│   ├── integrations/
│   │   ├── vite-plugin.ts            # Vite router integration + route injection
│   │   ├── nextjs-plugin.ts          # Next.js router integration + route injection
│   │   └── route-injector.ts         # Common route injection logic
│   └── types/
│       ├── fixtures.ts               # Fixture data types
│       ├── annotations.ts            # Annotation data types
│       ├── screenshot.ts             # Screenshot service types
│       ├── ui.ts                     # UI component types
│       └── config.ts                 # Configuration types
├── tests/
│   ├── unit/                         # Unit tests for each component
│   ├── integration/                  # Integration tests
│   └── e2e/                          # End-to-end workflow tests
├── demos/
│   ├── tanstack-router/              # Demo app using @tanstack/react-router
│   ├── nextjs/                       # Demo app using Next.js
│   └── shared/                       # Shared demo components and utilities
```

## Simplified Dependencies

### Core Production Dependencies
- **playwright** - Headless browser automation for screenshot capture
- **fs/promises** (Node.js built-in) - File system operations for JSON storage (no external dependency needed)
- **fabric** - Canvas drawing library for basic markup tools
- **clsx** - Utility for constructing className strings
- **zod** - TypeScript-first schema validation for fixtures and annotations
- **axios** - HTTP client for downloading annotation data from staging

### Removed Complexities
- No state management libraries (using simple React state)
- No complex UI component libraries (building minimal custom components)
- No image processing libraries (using browser's native screenshot capabilities)
- No database dependencies (using JSON files for storage)
- No real-time sync libraries (using simple download mechanism)
- No complex testing frameworks (using simple, focused tests)

## Development Workflow

### Development Phase
1. Configure fixtures for mock auth and dynamic route data (arrays for multiple instances)
2. Develop prototype using normal development tools
3. Access developer resolution UI at `/protobooth` during development
4. Click "Request Review" UI button to trigger screenshot capture

### Reviews Requested Phase
5. Screenshots captured with fixture data injected into app context/localStorage
6. Manual deployment to staging server with captured screenshots and annotation UI
7. Share staging URL with clients for review

### Review & Resolution Phase
8. Clients annotate screenshots on staging environment
9. Clients click "Publish" UI button to submit annotations
10. Developers download annotation data (.zip with JSON + marked-up images) to development environment
11. Implement changes using resolution UI
12. Mark feedback items as "resolved" and repeat cycle

### Self-Destruct
- CLI command: `npx protobooth cleanup`
- Removes all protobooth-related files and configurations
- Archives feedback data for documentation
- Uninstalls package dependencies

## Test-Driven Development Approach

**MANDATORY**: TDD is a core principle. Always write tests BEFORE implementation:

### TDD Cycle (Red-Green-Refactor)
1. **RED**: Write a failing test that describes desired functionality
2. **GREEN**: Write minimal code to make the test pass
3. **REFACTOR**: Improve code while keeping tests passing
4. **REPEAT**: Continue cycle for each new feature

### Test Strategy
1. **Unit Tests**: Each component under 201 lines with focused, simple tests
2. **Integration Tests**: Test component interactions and data flow
3. **E2E Tests**: Full workflow testing using demo applications
4. **Simplicity in Testing**: Avoid complex test frameworks, use simple assertions

### Demo Applications for Testing
- **demos/tanstack-router/**: Vite + @tanstack/react-router demo app (file-based routing)
- **demos/nextjs/**: Next.js demo app using App Router (recommended modern approach)
- **demos/shared/**: Common components and utilities for testing

**Note**: The Next.js demo uses the App Router exclusively, which is the recommended choice for new Next.js projects due to its modern features, performance benefits, and alignment with the future direction of the framework.

**Future Demo Applications** (Planned for comprehensive router coverage):
- **demos/nextjs-pages-router/**: Next.js demo using Pages Router (legacy support for existing projects)
- **demos/tanstack-code-based-router/**: TanStack Router demo using code-based routing (alternative to file-based)

### TDD Implementation Order
1. **Write failing tests** for route discovery → **Implement** → **Refactor**
2. **Write failing tests** for fixture management → **Implement** → **Refactor**
3. **Write failing tests** for screenshot capture → **Implement** → **Refactor**
4. **Write failing tests** for development UI workflow → **Implement** → **Refactor**
5. **Write failing tests** for staging annotation UI → **Implement** → **Refactor**
6. **Write failing tests** for route injection → **Implement** → **Refactor**
7. **Write failing tests** for file-based state management → **Implement** → **Refactor**
8. **Write failing tests** for download mechanism → **Implement** → **Refactor**
9. **Write failing tests** for end-to-end workflow → **Implement** → **Refactor**

### UI Development Principles
- **SCSS Namespacing**: Entire app wrapped in single `.protobooth` class at root to avoid conflicts (do NOT prefix every class name)
- **Route Safety**: UI routes (`/protobooth/*`) must not interfere with host application routes
- **Component Isolation**: React components should be self-contained with minimal external dependencies
- **File Size Limits**: Apply 201-line limit to `.tsx` and `.scss` files
- **State Persistence**: Use file-based storage to survive dev server restarts
- **Integration Testing**: Focus on testing complete workflows and route injection process
- **Staging Simulation**: Development environment must support simulating staging mode for annotation UI testing
- **TypeScript Strictness**: Do not use `any` types - create proper interfaces and leverage existing package types

### Testing Best Practices - CRITICAL

**MANDATORY RULE: ALWAYS USE TESTIDS**

Testing with text-based queries (`getByText`, `getByRole` with text) is **FORBIDDEN**. This rule is non-negotiable.

#### Why TestIds Are Mandatory:

1. **Stability**: UI text changes frequently during development - tests should not break when copy changes
2. **Internationalization**: Text-based queries fail completely when the app supports multiple languages
3. **Uniqueness**: Multiple elements often contain the same text (headings, badges, buttons) causing ambiguous queries
4. **Reliability**: TestIds provide explicit contracts between components and tests
5. **Maintainability**: Clear testIds make test failures easier to debug and understand

#### TestId Naming Conventions:

```typescript
// ✅ CORRECT - Use descriptive, specific testIds
<button data-testid="request-review-button">Request Review</button>
<h2 data-testid="workflow-state-title">In Development</h2>
<div data-testid="workflow-in-development">...</div>
<div data-testid="general-error-message">Error text</div>

// ✅ CORRECT - Use dynamic testIds for list items
<button data-testid={`resolve-annotation-${annotation.id}`}>Resolve</button>
<div data-testid={`${testId}-message`}>...</div>

// ❌ WRONG - Never use text queries
screen.getByText('In Development')  // FORBIDDEN
screen.getByRole('button', { name: 'Request Review' })  // FORBIDDEN
```

#### Test Query Priority (ALWAYS in this order):

1. **FIRST CHOICE**: `getByTestId` / `findByTestId` - Use for ALL queries
2. **NEVER USE**: `getByText`, `getByRole` with text, any text-based query

#### Example - Correct Test Pattern:

```typescript
// ✅ CORRECT
it('should transition to Reviews Requested state', async () => {
  render(<ResolveApp {...mockProps} />);

  await waitFor(() => {
    expect(screen.getByTestId('workflow-in-development')).toBeInTheDocument();
  });

  const button = screen.getByTestId('request-review-button');
  await user.click(button);

  await waitFor(() => {
    expect(screen.getByTestId('workflow-reviews-requested')).toBeInTheDocument();
  });
});

// ❌ WRONG - NEVER DO THIS
it('should transition to Reviews Requested state', async () => {
  render(<ResolveApp {...mockProps} />);

  expect(screen.getByText('In Development')).toBeInTheDocument(); // FORBIDDEN
  const button = screen.getByRole('button', { name: 'Request Review' }); // FORBIDDEN
  await user.click(button);

  expect(screen.getByText('Reviews Requested')).toBeInTheDocument(); // FORBIDDEN
});
```

#### Running Tests - CRITICAL:

Tests MUST be run from the project root directory with pattern matching:

```bash
# ✅ CORRECT - Always use this pattern
cd /c/developer/protobooth && npx vitest run {pattern} --no-coverage

# Examples:
cd /c/developer/protobooth && npx vitest run resolve-app --no-coverage
cd /c/developer/protobooth && npx vitest run resolve-app-workflow --no-coverage

# ❌ WRONG - Do not use full file paths
npx vitest run tests/integration/resolve-app-workflow.test.tsx  # May fail with "No test suite found"
```

**Why this matters**: Vitest has path resolution issues on Windows when using full file paths. Using pattern matching from the project root ensures reliable test execution.

#### Async Testing with React Components:

Always use `waitFor` for assertions that depend on async operations:

```typescript
// ✅ CORRECT - Wait for async operations
await waitFor(() => {
  expect(mockService.method).toHaveBeenCalledOnce();
});

// ❌ WRONG - Direct assertion on async operation
expect(mockService.method).toHaveBeenCalledOnce(); // May fail due to timing
```

## Implementation Priorities

1. **Create demo applications** for testing screenshot system
2. **Write tests** for automatic route discovery from router configurations
3. **Implement and test** fixture system for mock data injection
4. **Write tests** for screenshot capture with headless browser
5. **Implement and test** basic annotation UI for staging environment
6. **Write tests** for download mechanism (.zip format with JSON + images)
7. **Implement and test** developer resolution interface

## Implementation Details

### Multiple Dynamic Route Instances
- Users provide arrays of fixture objects for the same dynamic route
- Each fixture object creates a separate screenshot instance
- Example: `/user/[id]` with 3 different user fixtures = 3 screenshots
- **Screenshot Naming Convention**: Use actual route values - `/user/123.png`, `/user/456.png`, `/user/789.png`
- JSON annotation references link to screenshots using the actual route path

### UI Implementation
- **Framework**: React with SCSS for styling
- **CSS Namespacing**: Entire app wrapped in single `.protobooth` class at root to avoid conflicts (do NOT prefix every class name)
- **Route Integration**: Two routes injected into host app's dev server router:
  - `/protobooth/resolve` - Developer resolution interface with "Request Review" button
  - `/protobooth/annotate` - Client annotation interface with "Publish" button (staging only)
- **State Management**: File-based state storage to persist across dev server restarts
- **Testing Strategy**: Integration tests for full "Request Review" workflow and route injection process
- **Staging Simulation**: Development mode can simulate staging environment for annotation UI development

### UI Interaction
- **Development**: "Request Review" button on `/protobooth/resolve` triggers screenshot capture process
- **Staging**: "Publish" button on `/protobooth/annotate` allows clients to submit completed annotations
- Simple UX focused on clear workflow progression

### Deployment Approach
- Manual deployment to staging server (developers handle this)
- Future: May integrate with CI/CD pipelines for automation
- Focus on simplicity over automation initially

### Mock Authentication
- No real authentication system required
- Fixture auth data injected into app context/localStorage before screenshots
- Prototypes use mock data throughout - this tool supports that approach

### Download Format
- .zip file containing JSON annotation data + marked-up screenshot images
- Preserves visual context with annotations overlaid on screenshots
- Simple file-based approach for easy developer consumption

### Framework Integration
- Route discovery only - no deep integration with dev server lifecycle
- Parse router configuration files to extract route patterns
- Minimal integration points to maintain simplicity

### Testing Strategy
- **Test-Driven Development**: Mandatory TDD approach with Red-Green-Refactor cycle
- **Demo Apps**: Use real Vite and Next.js applications to test screenshot system
- **Simple Test Structure**: Follow 201-line limit for test files
- **End-to-End Validation**: Test complete workflow with demo applications

## Data Structures

```typescript
interface RouteFixture {
  auth?: {
    user: UserData;
    isAuthenticated: boolean;
    permissions: string[];
  };
  dynamicRoutes?: {
    [routePattern: string]: Record<string, any> | Record<string, any>[];
  };
  globalState?: {
    theme: string;
    language: string;
    featureFlags: Record<string, boolean>;
  };
}

interface Annotation {
  id: string;
  timestamp: Date;
  route: string;
  viewport: string;
  position: { x: number; y: number };
  content: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'resolved';
}

interface AnnotationSession {
  sessionId: string;
  createdAt: Date;
  annotations: Annotation[];
}
```