# UI Development Progress

This file tracks UI development tasks for the Protobooth Resolve and Annotate interfaces.

## Core Principles Reminder

- **ALWAYS** follow TDD approach (RED → GREEN → REFACTOR)
- **ALWAYS** use `data-testid` for testing (never `getByText`, `getByRole` with text)
- **NEVER** use `any` types - create proper interfaces
- Keep files under 201 lines
- Apply SOLID principles
- Simplicity first

## Current Session Accomplishments (2025-10-04)

### ✅ Completed

#### Screenshot System Fixes
- **Fixed TanStack Router dynamic route expansion**
  - Added `$param` syntax support to `DefaultRouteInstanceGenerator`
  - Routes now properly expand: `/product/$slug` → `/product/laptop`, `/product/mouse`
  - Screenshot count now correct: 27 screenshots (9 routes × 3 viewports)
  - Screenshot filenames use fixture values: `product_laptop_desktop.png` instead of `product_$slug_desktop.png`
  - Test coverage: 7 new tests in `route-instance-generator-tanstack.test.ts`

- **Fixed browser bundle issue**
  - Removed `process.cwd()` from browser code in `useResolveHandlers.ts`
  - Server now uses its own `projectRoot` when `projectPath` is empty

- **Improved debugging**
  - Added console logging to FixtureManager for route instance generation
  - Added console logging to ScreenshotCaptureService for route processing

#### Path A UI Enhancements (TDD RED → GREEN cycle)
- **Confirmation Modals** (Tasks #1-3)
  - Created ConfirmDialog component (70 lines) with variant support (default, warning, danger)
  - Integrated into workflow state changes (Request Review, Recapture, Reset Workflow)
  - 15 tests passing (10 unit + 5 integration)
  - Files: `src/ui/Core/components/ConfirmDialog/ConfirmDialog.tsx`
  - Test files: `tests/unit/confirm-dialog.test.tsx`, `tests/integration/resolve-app-confirm.test.tsx`

- **Loading Overlay** (Tasks #4-5)
  - Created LoadingOverlay component (47 lines) with progress support
  - Shows during screenshot capture with progress messages
  - Supports progress text and percentage display
  - 16 tests passing (11 unit + 5 integration)
  - Files: `src/ui/Core/components/LoadingOverlay/LoadingOverlay.tsx`
  - Test files: `tests/unit/loading-overlay.test.tsx`, `tests/integration/resolve-app-loading.test.tsx`

- **Sticky Toolbar Buttons** (Task #6)
  - Moved workflow buttons from view components to ResolveFooter toolbar
  - Updated ResolveTools.tsx (100 lines) with workflow-aware rendering
  - Simplified view components (reduced line counts by 71 lines total):
    - InDevelopmentView: 52 → 37 lines (-15)
    - ReviewsRequestedView: 60 → 44 lines (-16)
    - InReviewView: 41 → 11 lines (-30)
    - SubmittedForDevelopmentView: 66 → 56 lines (-10)
  - Better UX: Actions always visible at bottom, no scrolling needed

- **Sidebar Screenshot Navigation** (Tasks #7-8)
  - Created functional sidebar navigation component (87 lines)
  - Groups screenshots by route with expandable sections
  - Displays viewport name and dimensions for each screenshot
  - Highlights active screenshot with data-active attribute
  - Supports click-to-navigate between screenshots
  - Shows empty state when no screenshots captured
  - 9 unit tests passing
  - Updated SidebarLink component to accept HTMLAttributes (onClick, data-* attributes)
  - Files: `src/ui/Resolve/components/ResolveSidebar.tsx`
  - Test files: `tests/unit/resolve-sidebar.test.tsx`

#### Versioning Infrastructure
- **Created comprehensive versioning system**
  - `VERSIONING.md` (200+ lines) - Complete SemVer strategy
  - `CHANGELOG.md` - Keep a Changelog format
  - `src/version.ts` (38 lines) - Version constants and compatibility checking
  - Version metadata in workflow state files
  - Version display in UI footer ("protobooth v0.1.0")
  - NPM scripts for version bumping (patch, minor, major, alpha, beta, rc)

#### Documentation Updates
- **Updated Q&A.md**
  - Added 5 new UX workflow questions (Q8-Q12)
  - Removed obsolete content
  - Comprehensive coverage of architecture and workflow decisions

## Outstanding UI Tasks

### 🔴 High Priority - Core Functionality

#### Navigation & Screenshot Viewing
- [x] ~~**Sidebar screenshot navigation component**~~ ✅ COMPLETE (Tasks #7-8)
  - ✅ Displays list of captured screenshots
  - ✅ Groups screenshots by route
  - ✅ Shows viewport name and dimensions
  - ✅ Highlights currently selected screenshot
  - ✅ Supports click navigation between screenshots
  - ✅ Empty state when no screenshots captured
  - 9 unit tests passing

- [x] ~~**Toolbar workflow buttons placement**~~ ✅ COMPLETE
  - ✅ Moved 'Request Review', 'Recapture', etc. buttons to toolbar
  - ✅ Buttons always visible (sticky toolbar)
  - ✅ Main content area scrollable

- [x] ~~**Confirmation modals for state-changing actions**~~ ✅ COMPLETE
  - ✅ Confirm modal before "Request Review"
  - ✅ Confirm modal before "Recapture Screenshots"
  - ✅ Confirm modal before "Reset Workflow"
  - ✅ Confirm modal before "Start New Review Cycle"

- [x] ~~**Loading overlay with progress messages**~~ ✅ COMPLETE
  - ✅ Overlay displays during screenshot capture
  - ✅ Real-time progress messages shown
  - ✅ UI locked during capture (buttons disabled)
  - ✅ Progress text and percentage support

- [ ] **Update deployment message in Resolve UI**
  - Remove detailed deployment instructions
  - Assume staging server is already configured
  - Display message: "Inform the client that we are ready for the next round of review"
  - Show after successful screenshot capture

### 🔴 High Priority - UI Alignment

#### Resolve & Annotate UI Consistency
- [ ] **Align Annotate UI with Resolve UI standards**
  - **Context**: Resolve UI is the most up-to-date implementation
  - **Goal**: Ensure Annotate UI uses same components and classnames as Resolve UI
  - **Approach**: Systematic review and refactoring for consistency

##### Component Alignment Tasks
- [ ] **Update AnnotateApp to match ResolveApp structure**
  - Use same Layout component
  - Use same header structure with StatusBadge
  - Use same footer structure (ToolbarStack pattern)
  - Use same error handling pattern (ErrorMessage component)
  - Use same SCSS class naming conventions

- [ ] **Align Annotate sidebar with Resolve sidebar**
  - Use ResolveSidebar component as reference
  - Ensure same Sidebar.Section and Sidebar.Link structure
  - Match testid naming patterns
  - Ensure consistent grouping and display logic

- [ ] **Align Annotate toolbar/footer with Resolve footer**
  - Use ResolveFooter component as reference
  - Implement ToolbarStack for consistent toolbar layout
  - Ensure workflow buttons follow same pattern
  - Add version display if applicable

- [ ] **Standardize Core component usage**
  - Audit all Annotate components for Core component usage
  - Replace custom implementations with Core components where applicable
  - Ensure Button, Badge, ConfirmDialog, LoadingOverlay usage matches Resolve UI
  - Update prop interfaces to match Core component standards

- [ ] **SCSS class alignment**
  - Audit Annotate SCSS for class naming inconsistencies
  - Ensure all classes follow `.protobooth` wrapper pattern
  - Match Resolve UI class naming conventions
  - Remove duplicate styles that exist in Core/shared

- [ ] **TestId standardization**
  - Audit Annotate component testids
  - Match testid naming patterns from Resolve UI
  - Ensure consistent kebab-case format
  - Update any existing tests to use standardized testids

##### Verification Tasks
- [ ] **Create component parity checklist**
  - Document all Resolve UI components and patterns
  - Cross-reference with Annotate UI implementation
  - Identify gaps and inconsistencies
  - Prioritize alignment tasks

- [ ] **Write alignment integration tests**
  - Test that both UIs use same Core components
  - Test that both UIs follow same SCSS patterns
  - Test that both UIs have consistent testid patterns
  - Verify prop interfaces match across UIs

### 🟡 Medium Priority - UI/UX Improvements

#### Styling & Design System
- [ ] **SCSS design overhaul**
  - Implement "sharp" design: no rounding, no button spacing
  - Use defined CSS variables for colors
  - Create clear visual hierarchy
  - Make state-changing buttons prominent with colors

- [ ] **Establish common prop types across components**
  - Standardize `size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'`
  - Standardize `variant` types
  - Standardize `colorProfile: 'primary' | 'default' | 'error' | 'warn' | 'success' | 'info' | 'link'`
  - Update Button, Badge, and other shared components

- [ ] **Proper CSS namespacing with single `.protobooth` wrapper**
  - Entire app wrapped in `.protobooth` class (root element only)
  - **NOT** BEM notation
  - **DO NOT** prefix every class with `protobooth-` (e.g., NOT `.protobooth-card`)
  - Allow entity classes: `.card`, `.card-error`, `.card-info`
  - Allow atomic classes: `.flex`, `.justify-between`, `.text-center`
  - Document naming conventions in `src/ui/styles/agents.md`
  - Example structure:
    ```scss
    .protobooth {
      .card { /* ... */ }
      .card-error { /* ... */ }
      .flex { /* ... */ }
    }
    ```

- [ ] **SCSS code reuse**
  - Create SCSS variables for spacing, typography, breakpoints
  - Create SCSS functions for color manipulation, unit conversion
  - Create SCSS mixins for common patterns (flex layouts, button states)
  - Refer to `src/ui/styles/agents.md` for guidance

#### Component Architecture
- [ ] **Implement polymorphic components where applicable**
  - Allow components to render as different HTML elements
  - Example: `<Button as="a" href="...">` or `<Box as="section">`
  - Maintain type safety with TypeScript

- [ ] **Create reusable custom hooks**
  - Extract common logic from components
  - Examples: `useConfirmDialog`, `useKeyboardShortcuts`, `useViewportDetection`

- [ ] **Leverage useContext + useReducer pattern**
  - Consider for screenshot navigation state
  - Consider for annotation filtering/sorting
  - Avoid prop drilling for deeply nested state

### 🟢 Low Priority - Polish

#### Icons
- [ ] **Integrate ionicons**
  - Add ionicons scripts to HTML template (already defined below)
  - Replace text-only buttons with icon+text combinations
  - Use semantic icons: capture (camera), recapture (refresh), download (download)

```html
<script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
<script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
```

#### Code Cleanup
- [ ] **Remove redundant loading state messages**
  - Consolidate loading indicators
  - Use single source of truth for loading state

- [ ] **Remove dark mode support**
  - This tool is for office settings
  - Focus on single, polished light theme

## Notes

- **Year**: 2025 (remember when searching web resources)
- **Target Environment**: Office/business settings
- **No Dark Mode**: Light theme only for simplicity

## Testing Reminders

- **ALWAYS** use `data-testid` attributes
- **NEVER** use `getByText()`, `getByRole()` with text matching
- Text-based queries break with copy changes and internationalization
- TestIds provide explicit contracts between components and tests

## Session Handoff

When starting a new session:
1. Review completed items above
2. Choose next high-priority task
3. Follow TDD: Write failing test → Implement → Refactor
4. Update this file with progress
5. Keep CLAUDE.md principles in mind
