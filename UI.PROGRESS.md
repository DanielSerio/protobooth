# UI.PROGRESS.md

This file tracks development progress across Claude Code sessions for the protobooth resolve and annotate UIs.

# **IMPORTANT**

- ALWAYS KEEP OUR CORE PRINCIPLES IN MIND WHILE PLANNING, DEVELOPING, AND REFACTORING.
- If you do web searches, remember, it is the year 2025

## Items

- Update the sidebar & nav components to allow the user to navigate through the captured screenshots/annotations
- use common prop types across components as much as possible.
  - ex: `size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'`, `variant`, `colorProfile: 'primary' | 'default' | 'error' | 'warn' | 'success' | 'info' | 'link'`, etc.
- The UI currently has very minimal styling. It needs a big overhaul. we are using SCSS, and have defined colors as CSS variables already. the design of the panels/toolbars/toolbar buttons should be "sharp". no rounding, no spacing between buttons, etc.
- In general, we should try to use polymorphic components where applicable.
- remember, DO NOT USE 'BEM' NOTATION. This may adapt into an atomic 'mini component library'. Try to use a hybrid atomic/entity-based design approach. Alow classes like: '.card', '.card-error', '.card-info' but also: 'flex', 'justify-between', etc
- Currently, the design shows almost no hierarchy. Buttons that change state should be prominent, use colors to make particular toolbar buttons stand out if needed.
- the 'capture', 'recapture', (etc) buttons should be in the toolbar. the main area will be scrollable, and those buttons should always be visible to the user when appropriate based on workflow state
- ALWAYS use testids for ui tests. getBryRole, getByText, etc are unreliable
- state changing workflow buttons should have confirm modals. We should make sure the user is sure before we actually capture, recapture, etc
- use `ionicons` for icons:

```html
<script
  type="module"
  src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
<script
  nomodule
  src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
```

- Create SCSS variables, functions, and mixins wherever appropriate to take advantage of code reuse. please refer to the `agents.md` files within: `src\ui\styles`
- For your knowledge, this will typically be used in an office setting.
- For the above reason, we will NOT support a dark mode for the time being.
- try to design reusable custom hooks where appropriate.
- react `useContext` + react `useReducer` is a powerful combination. Remember to take advantage of this where appropriate.
- remove redundant loading state messages
- lock all UI buttons when workflow state is in transition or the screenshot capture process is in progress
- display an overlay loading state that displays loading state messages when the screenshot capture process is in progress
- The resolve UI displays a message to the developers about deployment. this is unneeded. It should be assumed that a staging server is already setup, and the deployment process is known. What should be displayed to the user is a message about informing the client that 'we are ready for the next round of annotations (review)', once the deployment has been completed
