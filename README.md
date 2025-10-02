# protobooth

[![Tests](https://img.shields.io/badge/tests-209%20passing-brightgreen)](https://github.com/protobooth/protobooth)
[![TypeScript](https://img.shields.io/badge/typescript-100%25-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The Smart Screenshot Tool That Thinks Like a Developer**

Stop wrestling with manual screenshot tools and broken feedback loops. **protobooth** automatically discovers your routes, captures consistent screenshots with real data, and creates a seamless client review experience - all designed to disappear when you don't need it anymore.

## 🎉 What's New

**October 2025** - Full UI Suite Complete!

- ✅ **Developer Resolution UI** - Complete workflow management at `/protobooth/resolve`
- ✅ **Client Annotation UI** - Intuitive feedback interface at `/protobooth/annotate`
- ✅ **209 Tests Passing** - Comprehensive TDD coverage with zero TypeScript errors
- ✅ **Production Ready** - Full service integration with dependency injection

---

## 🚨 The 2025 Frontend Feedback Crisis

While tools like Marker.io and zipBoard force you into their rigid workflows, and screenshot services like Percy require complex CI setup, **protobooth** solves the real problem:

<table>
<tr>
<td width="50%">

### ❌ The Old Way

- 😤 Manual route screenshots (miss routes, inconsistent data)
- 🔧 Generic annotation tools (don't understand your app structure)
- 💰 Permanent feedback platforms (overkill for prototyping)
- 🐌 Complex CI integrations (slow, brittle, expensive)

</td>
<td width="50%">

### ✅ The protobooth Way

- 🧠 **Auto-discovers ALL routes** (Vite, Next.js)
- 📸 **Fixture-perfect screenshots** (consistent every time)
- ⚡ **One-click reviews** ("Request Review" → done)
- 🗑️ **Disposable design** (self-destructs when done)

</td>
</tr>
</table>

---

## ✨ Key Features

### 🚀 **Zero Configuration Route Discovery**

Works seamlessly with your existing router setup:

- **Vite + @tanstack/react-router**: Automatically detects routes from `createFileRoute()` calls
- **Next.js App Router**: Full support for modern `/app/user/[id]/page.tsx` structure
- **Next.js Pages Router**: Legacy support for `/pages/[id].tsx` patterns
- **Dynamic Routes**: Extracts parameters from `$userId`, `[id]`, `[...slug]` patterns automatically
- **Smart Filtering**: Excludes protobooth routes and non-page files automatically

**No manual route definitions. Ever.**

### 🎭 **Fixture-Based Consistency**

Define your mock data once, get consistent screenshots forever:

```typescript
fixtures: {
  auth: {
    user: { id: 1, name: 'Demo User', role: 'admin' },
    isAuthenticated: true,
    permissions: ['read', 'write']
  },
  dynamicRoutes: {
    '/user/$userId': [
      { userId: '123', name: 'John Doe', role: 'user' },
      { userId: '456', name: 'Jane Smith', role: 'admin' },
    ]
  },
  globalState: {
    theme: 'light',
    language: 'en',
    featureFlags: { newFeature: true }
  }
}
```

- ✅ **Mock Authentication**: Define auth state, user data, and permissions
- ✅ **Multiple Instances**: Generate multiple screenshots per dynamic route
- ✅ **Global State**: Configure theme, language, feature flags
- ✅ **Type-Safe**: Full TypeScript support with Zod validation

### 📱 **Multi-Viewport Screenshots**

Responsive design review made simple:

- **Playwright Integration**: Reliable headless browser automation
- **Configurable Viewports**: Define custom viewport sizes and names
- **Fixture Injection**: Mock data injected into localStorage before capture
- **Concurrent Capture**: Fast screenshot generation across all viewports

### 💬 **Intuitive Annotation Interface**

Client-friendly UI that non-technical users actually enjoy:

- **Canvas Drawing Tools**: Arrows, rectangles, freehand drawing
- **Color Picker**: Visual feedback with customizable colors
- **Priority Levels**: Low, medium, high priority annotations
- **Annotation List**: Organized feedback with edit/delete capabilities
- **One-Click Publish**: Simple workflow for clients

### 🎨 **Developer Resolution UI**

Powerful workflow management for developers:

- **4-State Workflow**: In Development → Reviews Requested → In Review → Submitted for Development
- **Annotation Download**: .zip file with JSON data + marked-up images
- **Visual Context**: Annotations overlaid on screenshots
- **Progress Tracking**: Track feedback resolution status

### 🗑️ **Disposable by Design**

Built for the prototyping phase only:

```bash
npx protobooth cleanup
```

- Removes all protobooth files and configurations
- Preserves feedback history for documentation
- Uninstalls dependencies cleanly
- No permanent infrastructure required

---

## 🎯 Implementation Status

### ✅ **COMPLETE: Full Feature Set**

**Core Infrastructure (209 Tests Passing)**

- ✅ Vite Plugin with route discovery and injection
- ✅ Next.js Plugin with App Router and Pages Router support
- ✅ Fixture system with Zod validation
- ✅ Screenshot capture with Playwright
- ✅ Multi-viewport support
- ✅ Service factory with dependency injection
- ✅ File-based state management

**User Interfaces (Complete)**

- ✅ Developer Resolution UI at `/protobooth/resolve`
  - 4-state workflow management
  - Screenshot capture workflow
  - Annotation download (.zip format)
  - Error handling and retry logic
- ✅ Client Annotation UI at `/protobooth/annotate`
  - Canvas drawing tools (arrows, rectangles, freehand)
  - Color picker with preset colors
  - Annotation CRUD operations
  - Publish workflow with confirmation
  - Screenshot loading and display

**Developer Experience**

- ✅ Zero TypeScript errors (100% type-safe)
- ✅ All files under 201 lines (maintainability)
- ✅ Test-driven development approach
- ✅ Comprehensive test coverage (83 unit, 126 integration)
- ✅ Clean SOLID architecture

---

## 🚀 Quick Start

### Installation (Future. Not yet uploaded to NPM)

```bash
npm install protobooth
```

### Vite Setup (2 Minutes)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { protobooth } from 'protobooth/vite';

export default defineConfig({
  plugins: [
    react(),
    protobooth({
      fixtures: {
        auth: {
          authenticated: {
            user: { id: '1', name: 'Demo User', email: 'demo@example.com' },
            token: 'mock-token-123',
            permissions: ['read', 'write'],
          },
          unauthenticated: null,
        },
        dynamicRoutes: {
          '/user/$userId': [
            { userId: '123', name: 'John Doe', role: 'user' },
            { userId: '456', name: 'Jane Smith', role: 'admin' },
          ],
          '/product/$slug': [
            { slug: 'laptop', name: 'Gaming Laptop', price: 1299 },
            { slug: 'mouse', name: 'Wireless Mouse', price: 79 },
          ],
        },
        globalState: {
          theme: 'light',
          language: 'en',
          featureFlags: { newFeature: true },
        },
      },
      viewports: [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'desktop', width: 1440, height: 900 },
      ],
    }),
  ],
});
```

**🎉 Done!** Start your dev server and visit `http://localhost:5173/protobooth/resolve`

### Next.js Setup

```javascript
// next.config.js
const { withProtobooth } = require('protobooth/next');

module.exports = withProtobooth(
  {
    // Your existing Next.js config
  },
  {
    protobooth: {
      fixtures: {
        auth: {
          authenticated: {
            user: { id: '1', name: 'Next.js User', email: 'user@example.com' },
            token: 'nextjs-token',
            permissions: ['read', 'write', 'admin'],
          },
          unauthenticated: null,
        },
        dynamicRoutes: {
          '/user/[id]': [
            { id: '1', name: 'Alice Johnson', role: 'user' },
            { id: '2', name: 'Bob Smith', role: 'admin' },
          ],
          '/blog/[slug]': [
            { slug: 'getting-started', title: 'Getting Started' },
            { slug: 'advanced-patterns', title: 'Advanced Patterns' },
          ],
        },
        globalState: {
          theme: 'dark',
          language: 'en',
          featureFlags: { newLayout: true },
        },
      },
      viewports: [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1440, height: 900 },
      ],
    },
  }
);
```

---

## 📋 Workflow

### 1️⃣ Development Phase

1. Configure fixtures for mock data
2. Develop your prototype normally
3. Access developer UI at `/protobooth/resolve`

### 2️⃣ Request Review

1. Click **"Request Review"** button in developer UI
2. Screenshots captured automatically with fixture data
3. Deploy to staging server (manual deployment to any static host)

### 3️⃣ Client Review

1. Share staging URL with clients
2. Clients access annotation UI at `/protobooth/annotate`
3. Clients use drawing tools to mark up screenshots
4. Clients click **"Publish"** when feedback is complete

### 4️⃣ Implement Changes

1. Download .zip file with annotations and marked-up images
2. Review feedback in development UI
3. Implement changes and mark as resolved
4. Repeat cycle until prototype is approved

### 5️⃣ Clean Up

```bash
npx protobooth cleanup
```

Removes all protobooth files and dependencies when prototyping is done.

---

## 🥊 protobooth vs The Competition

| Feature                     | protobooth       | Marker.io      | zipBoard       | Percy          | Feedbucket     |
| --------------------------- | ---------------- | -------------- | -------------- | -------------- | -------------- |
| **Auto Route Discovery**    | ✅ Smart         | ❌ Manual      | ❌ Manual      | ❌ Manual      | ❌ Manual      |
| **Fixture Data Injection**  | ✅ Built-in      | ❌ None        | ❌ None        | ❌ Basic       | ❌ None        |
| **Development Integration** | ✅ Native        | ⚠️ Plugin      | ⚠️ Plugin      | ⚠️ CI Only     | ❌ External    |
| **Client Annotation UI**    | ✅ Included      | ✅ Included    | ✅ Included    | ❌ None        | ✅ Included    |
| **Developer Workflow UI**   | ✅ Included      | ⚠️ Basic       | ⚠️ Basic       | ❌ None        | ❌ None        |
| **Disposable Design**       | ✅ Self-destruct | ❌ Permanent   | ❌ Permanent   | ❌ Permanent   | ❌ Permanent   |
| **TypeScript First**        | ✅ 100%          | ⚠️ Partial     | ⚠️ Partial     | ✅ Yes         | ❌ No          |
| **Pricing**                 | 🆓 **Free**      | 💰 $39/mo      | 💰 $29/mo      | 💰 $149/mo     | 💰 $19/mo      |
| **Setup Time**              | ⚡ **2 minutes** | ⏰ 30+ minutes | ⏰ 20+ minutes | ⏰ Hours       | ⏰ 15+ minutes |
| **Open Source**             | ✅ MIT           | ❌ Proprietary | ❌ Proprietary | ❌ Proprietary | ❌ Proprietary |

---

## 🎯 Perfect For

### 🏢 **Agencies & Freelancers**

Stop losing hours to screenshot busywork. One click captures every route with consistent data. Impress clients with professional review workflows.

### 🚀 **Startup Teams**

Get investor feedback on prototypes without complex tooling. Deploy, annotate, iterate. Move fast without breaking your workflow.

### 🎨 **Design-Dev Handoffs**

Bridge the gap with visual feedback that developers actually understand. Annotations linked directly to routes and screenshots.

### 💼 **Client-Facing Projects**

Professional review experience without teaching clients new tools. They click, they draw, they're done.

---

## 💡 Pro Tips

- ✨ **Smart Fixtures**: Define once, screenshot forever with consistent data
- 🎯 **Route Patterns**: Automatically handles `/user/[id]`, `/blog/[...slug]`, and more
- 📱 **Responsive Ready**: Mobile + desktop screenshots out of the box
- 🚀 **Zero Config**: Works with your existing router setup
- 🎨 **Custom Viewports**: Define any viewport size you need
- 🗑️ **Clean Exit**: `npx protobooth cleanup` when you're done
- 🔄 **Iteration Friendly**: Fast cycle times for rapid prototyping

---

## 📚 Requirements

- **React** 18+ (works with any React framework)
- **Node.js** 18+ (uses modern fs/promises APIs)
- **TypeScript** 5+ recommended (100% type-safe)
- Modern browser for client reviews (Chrome, Firefox, Safari, Edge)
- Staging server for deployment (any static host: Vercel, Netlify, GitHub Pages)

---

## 🏗️ Architecture

protobooth follows clean architecture principles:

- **🎯 SOLID Design**: Single Responsibility, Dependency Injection
- **🧪 TDD Approach**: 209 tests (83 unit, 126 integration)
- **📏 File Size Limits**: All files under 201 lines for maintainability
- **🔒 Type Safety**: Zero `any` types - 100% type-safe TypeScript
- **🎨 Modular UI**: Separate Core, Resolve, and Annotate modules
- **🔌 Plugin-Based**: Vite and Next.js plugins for framework integration

---

## 🤝 Contributing

protobooth is in active development. We welcome contributions that align with our simplicity-first philosophy:

1. **Test-Driven Development**: Write tests before implementation
2. **TypeScript Strict Mode**: No `any` types allowed
3. **File Size Limits**: Keep files under 201 lines
4. **SOLID Principles**: Clean, maintainable architecture
5. **Documentation**: Update CLAUDE.md with architectural decisions

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines.

---

## 📜 License

MIT © 2025 protobooth

Free for commercial and personal use. See [LICENSE](./LICENSE) for details.

---

## 🚀 Ready to 10x Your Prototype Reviews?

Stop wasting hours on manual screenshots. Join the developers who've discovered the smart way to handle client feedback.

```bash
npm install protobooth
```

### What You Get

- ✅ **Automatic route discovery** for Vite and Next.js
- ✅ **Fixture-based consistent screenshots** with mock data
- ✅ **Client annotation UI** that non-technical users love
- ✅ **Developer workflow UI** for feedback management
- ✅ **209 tests passing** - battle-tested reliability
- ✅ **Zero configuration** - works out of the box
- ✅ **Self-destructing** - clean removal when done

### Get Help

- 📖 **Documentation**: [Full docs in CLAUDE.md](./CLAUDE.md)
- 🐛 **Issues**: [Report bugs on GitHub](https://github.com/protobooth/protobooth/issues)
- 💬 **Discussions**: [Join the conversation](https://github.com/protobooth/protobooth/discussions)
- 📧 **Contact**: Open an issue for support

---

<div align="center">

**Built for developers, by developers, in 2025** 🛠️

[![GitHub](https://img.shields.io/badge/GitHub-protobooth-blue?logo=github)](https://github.com/protobooth/protobooth)

<!-- [![npm](https://img.shields.io/badge/npm-protobooth-red?logo=npm)](https://www.npmjs.com/package/protobooth) -->

[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

</div>
