# Q&A - Protobooth

Common questions about protobooth design decisions, usage, and philosophy.

## Project Philosophy

### Q: Why create protobooth when tools like Storybook, Percy, and Chromatic exist?

**A:** Protobooth serves a different purpose. Those tools are designed for **component libraries** and **long-term visual regression testing**. Protobooth is specifically designed for the **prototype-to-client review workflow** during early development phases. Key differences:

- **Disposable by design** - Self-destructs when you're done prototyping
- **Route-based** - Captures full page flows, not isolated components
- **Client-facing** - Optimized for non-technical stakeholder feedback
- **Zero infrastructure** - No accounts, no cloud services, no ongoing costs
- **Fixture-first** - Built around mock data for consistent reviews

Once your prototype graduates to a real application, you remove protobooth and switch to proper staging environments and visual regression tools.

### Q: Why is protobooth "disposable"? Isn't that wasteful?

**A:** The disposable nature is a **feature, not a limitation**. Prototypes are temporary by definition. Protobooth acknowledges this reality:

- **No technical debt** - You're not maintaining infrastructure for a prototype phase
- **Clear boundaries** - When prototyping ends, cleanup is explicit
- **Honest tooling** - It doesn't pretend your prototype code is production-ready
- **Fast iteration** - No need to architect for longevity during exploration

The `npx protobooth cleanup` command archives feedback data and removes all protobooth code, leaving you with a clean transition path to production architecture.

### Q: Why the 201-line file size limit? Isn't that arbitrary?

**A:** The 201-line limit enforces **simplicity and modularity** as core architectural constraints:

- **Forces decomposition** - You can't create monolithic files
- **Improves readability** - Every file fits comfortably on one screen
- **Encourages SOLID** - Single Responsibility becomes natural, not aspirational
- **Maintains focus** - Each file does one thing well
- **Easier testing** - Small, focused files are easier to test thoroughly

If you can't express your component in 201 lines, it's telling you something needs to be broken down. This constraint has consistently improved code quality throughout the project.

## Architecture Decisions

### Q: Why use fixtures instead of connecting to a real backend?

**A:** Fixtures provide **consistency and control** essential for client reviews:

- **Reproducible state** - Every screenshot shows the same data
- **No backend required** - Start getting feedback before API development
- **Test-like reliability** - Same approach used in test suites
- **Client focus** - Reviews focus on UI/UX, not data accuracy
- **Controlled scenarios** - Easy to show edge cases (empty states, errors, etc.)

For prototypes, data accuracy is less important than demonstrating workflows and gathering UI feedback. Real data integration comes after the prototype phase.

### Q: Why no database? Why store everything in JSON files?

**A:** Simplicity alignment with the disposable nature:

- **Zero setup** - No database installation, no migrations, no connection strings
- **No persistence layer** - No ORM, no query builder, no data modeling
- **Portable** - JSON files move easily between environments
- **Transparent** - Anyone can read/edit annotation data
- **Disposable-friendly** - No database to tear down during cleanup
- **Version control** - Annotation history lives in git if desired

For a tool that handles dozens of annotations during a prototype phase, JSON files are completely sufficient. We're not building a production system.

### Q: Why require a separate staging server instead of sharing the dev server?

**A:** **Security and separation of concerns**:

- **Dev environment exposure** - Developer tools shouldn't be accessible to clients
- **Different contexts** - Developers need debugging tools; clients need annotation UI
- **State isolation** - Dev work shouldn't interfere with client reviews
- **Professional presentation** - Staging provides a clean, production-like experience
- **Access control** - Staging can be password-protected without affecting dev workflow

The staging deployment is intentionally manual and simple - just static files and a basic server. No complex deployment pipelines needed.

### Q: Why manual deployment to staging? Why not automate it?

**A:** **Simplicity first** - automation can be added later if needed:

- **Prototype pace** - Manual deploys match prototype iteration speed
- **No infrastructure** - No CI/CD pipeline to set up and maintain
- **Explicit control** - Developers choose when to share with clients
- **Future-compatible** - Easy to integrate with CI/CD when you need it

During the prototype phase, you're typically deploying for review every few days, not multiple times per day. Manual deployment is perfectly adequate and avoids over-engineering.

## Technical Choices

### Q: Why Test-Driven Development for a prototyping tool?

**A:** TDD ensures **reliability even for disposable code**:

- **Prototypes aren't throwaway** - They become the foundation for real apps
- **Client trust** - Buggy prototypes undermine stakeholder confidence
- **Faster iteration** - Tests catch regressions during rapid changes
- **Documentation** - Tests show how the tool is meant to work
- **Confidence** - Developers trust the tool won't break their prototype

Just because protobooth itself is disposable doesn't mean it can be unreliable. The TDD approach has already caught numerous edge cases during development.

### Q: Why support both Vite and Next.js? Why not focus on one?

**A:** **Meet developers where they are**:

- **Different ecosystems** - React developers use different tools
- **Minimal abstraction** - Each plugin leverages native router patterns
- **No vendor lock-in** - Works with your existing setup
- **Parallel development** - Vite and Next.js support different use cases

The plugin architecture keeps framework-specific code isolated (under 201 lines each), making maintenance straightforward despite supporting multiple frameworks.

### Q: Why Playwright instead of Puppeteer or other browser automation tools?

**A:** Playwright offers **better multi-browser support** and **modern API design**:

- **Multiple browsers** - Chromium, Firefox, WebKit out of the box
- **Auto-wait** - Built-in waiting for elements, reducing flaky tests
- **Modern async/await** - Clean API design
- **Active development** - Microsoft backing, frequent updates
- **Better TypeScript support** - First-class TypeScript integration

However, the screenshot service uses dependency injection, so alternative implementations (Puppeteer, Selenium) could be added if needed.

## Usage Patterns

### Q: How do I handle authentication-protected routes?

**A:** Use **fixture-based mock authentication**:

```typescript
protobooth({
  fixtures: {
    auth: {
      authenticated: {
        user: { id: '1', name: 'John Doe', email: 'john@example.com' },
        token: 'mock-jwt-token',
        permissions: ['read', 'write', 'admin'],
      },
      unauthenticated: null,
    },
  },
});
```

The screenshot service injects this fixture data into your app's context/localStorage before capturing, allowing authenticated routes to render. **No real authentication needed** - we're demonstrating UI, not security.

### Q: What if my routes aren't file-based?

**A:** Current version supports:

- **Vite**: `@tanstack/react-router` file-based routes
- **Next.js**: App Router (file-based)
- **Next.js**: Pages Router (file-based) - legacy support

For code-based routing (e.g., React Router with route configs), a future plugin could parse your route configuration files. The architecture supports this - route discovery is isolated in each plugin.

If this is a blocker for you, consider creating a custom route discovery implementation. See `src/integrations/vite-plugin.ts` for reference.

### Q: Can I customize the annotation UI?

**A:** The annotation UI is intentionally **simple and opinionated**:

- **Basic markup tools** - Draw, text, arrows
- **Simple comments** - Text feedback with priority levels
- **No customization needed** - Designed for universal client use

If you need custom annotation features, you can:

1. Fork the project and modify `src/ui/Annotate/`
2. Use the downloaded JSON/images and build your own review interface
3. Use a different tool - protobooth prioritizes simplicity over customization

Remember: this is for **prototype feedback**, not production review workflows.

### Q: How do I handle dynamic routes with multiple instances?

**A:** Provide an **array of fixture objects**:

```typescript
protobooth({
  fixtures: {
    dynamicRoutes: {
      '/user/[id]': [
        { id: '123', name: 'John Doe', role: 'admin' },
        { id: '456', name: 'Jane Smith', role: 'user' },
        { id: '789', name: 'Bob Wilson', role: 'guest' },
      ],
    },
  },
});
```

This generates three screenshots: `/user/123`, `/user/456`, `/user/789`, each with its corresponding data. Perfect for showing different user states or content variations.

### Q: What happens to annotation data after the prototype phase?

**A:** The data is **yours to keep or discard**:

- **Cleanup command** - `npx protobooth cleanup` archives annotations before removal
- **Archived format** - JSON + marked-up images in a timestamped folder
- **Documentation** - Can be added to project docs as "initial design feedback"
- **Disposable** - Or delete it - the prototype phase is over

The tool doesn't force any particular approach to data retention. It's your project, your decision.

## Integration and Workflow

### Q: How does protobooth fit into CI/CD pipelines?

**A:** It **doesn't need to** during the prototype phase:

- **Local development** - Developers use it locally during prototyping
- **Manual staging deploys** - Push to staging when ready for review
- **No build pipeline** - Minimal infrastructure during exploration

**After prototyping**, when you remove protobooth:

- CI/CD handles real deployments to proper staging environments
- Visual regression testing moves to Chromatic/Percy/similar
- Protobooth has served its purpose and been removed

If you want CI integration during prototyping, you can add it, but it's not necessary for the tool to be useful.

### Q: Can I use protobooth in production?

**A:** **No. Absolutely not.** Protobooth is explicitly designed for **prototype phase only**:

- **Mock data** - Fixtures aren't real data
- **No authentication** - Mock auth states aren't secure
- **Local dev tooling** - Not designed for production scale
- **Disposable architecture** - Should be removed, not deployed

Using protobooth in production violates its core design principles. When your prototype becomes a real application, remove protobooth and implement proper:

- Backend APIs with real data
- Proper authentication and authorization
- Production-ready state management
- Staging environments with real infrastructure
- Proper monitoring and error handling

### Q: How do I transition away from protobooth?

**A:** The **self-destruct command** handles cleanup:

```bash
npx protobooth cleanup
```

This command:

1. Archives all annotation data (JSON + images)
2. Removes all protobooth routes from your application
3. Removes protobooth configuration from build configs
4. Uninstalls the npm package
5. Removes protobooth-specific files

What remains:

- Your prototype UI components (cleaned up)
- Archived feedback for reference
- A clear path to production architecture

The transition is **intentionally explicit** - no lingering technical debt.

## Development and Contribution

### Q: Why TypeScript without `any` types?

**A:** **Type safety is essential** even for disposable tools:

- **Catches bugs** - TypeScript errors prevented many issues during development
- **Better refactoring** - Confident code changes with type checking
- **Self-documenting** - Types serve as inline documentation
- **IDE support** - Better autocomplete and error detection
- **No escape hatches** - `any` types defeat the purpose of TypeScript

The strict TypeScript approach has consistently improved code quality and made the codebase easier to maintain.

### Q: Can I contribute to protobooth?

**A:** Contributions are welcome! Keep core principles in mind:

- **Test-first** - Write tests before implementation
- **Simplicity** - Avoid adding complexity
- **SOLID principles** - Clean architecture
- **201-line limit** - Keep files focused and small
- **No databases** - Maintain simplicity with file-based storage

See `CLAUDE.md` for complete development guidelines.

### Q: Why are there so many documentation files?

**A:** **Different audiences, different needs**:

- **README.md** - User-facing project overview
- **CLAUDE.md** - Complete technical guidance for AI-assisted development
- **PROGRESS.README.md** - Development progress tracking across sessions
- **Q&A.md** (this file) - Common questions and answers

Each file serves a specific purpose and audience. They're intentionally kept separate rather than merged into one massive document.

## Troubleshooting

### Q: Screenshots aren't capturing my authenticated routes?

**A:** Ensure fixture auth data is being **injected correctly**:

1. Check your fixture configuration includes `auth.authenticated`
2. Verify your app's auth context/store accepts the mock data
3. Test locally that fixtures work before capturing screenshots
4. Check console logs during screenshot capture for injection errors

The fixture manager should inject auth data before page load. If your app uses complex auth flows, you may need to adjust your app's dev mode handling.

### Q: The UI routes (`/protobooth/*`) conflict with my app routes?

**A:** This shouldn't happen - protobooth routes are explicitly filtered:

- **Automatic exclusion** - Route discovery skips `/protobooth/*` patterns
- **Namespaced** - All protobooth routes use `/protobooth/` prefix
- **Collision detection** - Plugins warn if conflicts are detected

If you have a legitimate route that starts with `/protobooth/`, consider renaming it during the prototype phase, or configure protobooth to use a different prefix (feature not yet implemented, but possible).

### Q: Tests are failing after I updated my routes?

**A:** **Regenerate routes.json**:

```bash
# For Vite projects
npm run dev  # Routes are discovered on dev server start

# For Next.js projects
npm run dev  # Routes are discovered during build
```

The `routes.json` file is auto-generated and should not be committed to version control (it's in `.gitignore`). Each developer's routes.json reflects their current codebase state.

### Q: The annotation UI isn't showing my screenshots?

**A:** Verify **staging deployment** included all assets:

1. Check that screenshot images were copied to staging server
2. Verify `routes.json` was deployed with correct paths
3. Ensure static file serving is configured correctly
4. Check browser console for 404 errors

The staging environment needs both the annotation UI HTML and all screenshot assets. The deployment process should copy everything in the output directory.

---

## Still Have Questions?

- **Check the documentation**: `CLAUDE.md` has extensive technical details
- **Review the architecture**: `architecture.md` explains system design
- **Read the progress log**: `PROGRESS.README.md` shows implementation decisions
- **File an issue**: https://github.com/anthropics/protobooth/issues (replace with actual repo URL)

Remember: protobooth is designed for **simplicity during the prototype phase**. If something feels complex or over-engineered, that's probably not the protobooth way. Keep it simple, get feedback fast, and remove the tool when prototyping ends.
