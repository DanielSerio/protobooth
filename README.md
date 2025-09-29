# protobooth

> **The Smart Screenshot Tool That Thinks Like a Developer**

Stop wrestling with manual screenshot tools and broken feedback loops. **protobooth** automatically discovers your routes, captures consistent screenshots with real data, and creates a seamless client review experience - all designed to disappear when you don't need it anymore.

## 🚨 The 2025 Frontend Feedback Crisis

While tools like Marker.io and zipBoard force you into their rigid workflows, and screenshot services like Percy require complex CI setup, **protobooth** solves the real problem:

❌ **Manual route screenshots** (miss routes, inconsistent data)
❌ **Generic annotation tools** (don't understand your app structure)
❌ **Permanent feedback platforms** (overkill for prototyping)
❌ **Complex CI integrations** (slow, brittle, expensive)

## ✅ The protobooth Difference

Unlike traditional feedback tools, protobooth is **development-aware**:

1. **🧠 Smart Discovery**: Automatically finds ALL your routes (Vite, Next.js)
2. **📸 Fixture-Perfect Screenshots**: Consistent mock data every time
3. **⚡ One-Click Reviews**: "Request Review" → done
4. **🗑️ Disposable**: Self-destructs when prototyping ends

## Key Features

### 🚀 **Zero Configuration Route Discovery**

- Automatically detects all routes from your Vite or Next.js application
- No manual route definitions required
- Works with `@tanstack/react-router` and Next.js routing

### 🎭 **Fixture-Based Consistency**

- Define mock authentication and dynamic route data
- Consistent screenshots across review cycles
- Perfect for prototype development with mock data

### 📱 **Multi-Viewport Screenshots**

- Capture mobile, tablet, and desktop views automatically
- Configurable viewport sizes
- Responsive design review made simple

### ✏️ **Simple Client Interface**

- Intuitive annotation tools for non-technical users
- No accounts or complex setup required
- Clean staging environment for client reviews

### 📦 **One-Click Download**

- Get feedback as a .zip file with JSON data + marked-up images
- Visual context preserved with annotations overlaid
- Import directly into your development workflow

### 🗑️ **Disposable by Design**

- Built for the prototyping phase only
- Self-destruct when prototyping is complete
- No permanent infrastructure required

## Quick Start

### Installation

```bash
npm install protobooth
```

### Vite Setup

```typescript
// vite.config.ts
import { protobooth } from 'protobooth/vite';

export default defineConfig({
  plugins: [
    react(),
    protobooth({
      fixtures: {
        auth: {
          user: { id: 1, name: 'Demo User', role: 'admin' },
          isAuthenticated: true,
        },
        dynamicRoutes: {
          '/user/[id]': [
            { id: '123', name: 'John Doe' },
            { id: '456', name: 'Jane Smith' },
          ],
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

### Next.js Setup

```typescript
// next.config.js
const { withProtobooth } = require('protobooth/next');

module.exports = withProtobooth({
  protobooth: {
    fixtures: {
      auth: {
        user: { id: 1, name: 'Demo User', role: 'admin' },
        isAuthenticated: true,
      },
      dynamicRoutes: {
        '/user/[id]': { id: '123' },
      },
    },
    viewports: [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'desktop', width: 1440, height: 900 },
    ],
  },
});
```

## Workflow

### 1. Development

- Configure fixtures for mock data
- Develop your prototype normally
- Access protobooth UI at `/protobooth`

### 2. Request Review

- Click "Request Review" button
- Screenshots captured with fixture data
- Deploy to staging server (manual)

### 3. Client Review

- Share staging URL with clients
- Clients annotate screenshots
- Click "Publish" when feedback is complete

### 4. Implement Changes

- Download .zip file with annotations
- Review feedback in development UI
- Implement changes and mark as resolved
- Repeat cycle until prototype is approved

## 🥊 protobooth vs The Competition

| Feature                     | protobooth       | Marker.io      | zipBoard       | Percy        | Feedbucket     |
| --------------------------- | ---------------- | -------------- | -------------- | ------------ | -------------- |
| **Auto Route Discovery**    | ✅ Smart         | ❌ Manual      | ❌ Manual      | ❌ Manual    | ❌ Manual      |
| **Fixture Data Injection**  | ✅ Built-in      | ❌ None        | ❌ None        | ❌ Basic     | ❌ None        |
| **Development Integration** | ✅ Native        | ⚠️ Plugin      | ⚠️ Plugin      | ⚠️ CI Only   | ❌ External    |
| **Disposable Design**       | ✅ Self-destruct | ❌ Permanent   | ❌ Permanent   | ❌ Permanent | ❌ Permanent   |
| **Pricing**                 | 🆓 Free          | 💰 $39/mo      | 💰 $29/mo      | 💰 $149/mo   | 💰 $19/mo      |
| **Setup Time**              | ⚡ 2 minutes     | ⏰ 30+ minutes | ⏰ 20+ minutes | ⏰ Hours     | ⏰ 15+ minutes |

## 🎯 Perfect For

### 🏢 **Agencies & Freelancers**

Stop losing hours to screenshot busywork. One click captures every route with consistent data.

### 🚀 **Startup Teams**

Get investor feedback on prototypes without complex tooling. Deploy, annotate, iterate.

### 🎨 **Design-Dev Handoffs**

Bridge the gap with visual feedback that developers actually understand.

### 💼 **Client-Facing Projects**

Professional review experience without teaching clients new tools.

## ⚡ Get Started in 2 Minutes

### Installation

```bash
npm install protobooth
```

### Instant Setup (Vite)

```typescript
// vite.config.ts - Add one plugin, get everything
import { protobooth } from 'protobooth/vite';

export default defineConfig({
  plugins: [react(), protobooth()], // ← That's it
});
```

**🎉 Done!** Visit `localhost:5173/protobooth` and click "Request Review"

## 💡 Pro Tips for 2025

✨ **Smart Fixtures**: Define once, screenshot forever with consistent data
🎯 **Route Patterns**: Automatically handles `/user/[id]`, `/blog/[...slug]`, and more
📱 **Responsive Ready**: Mobile + desktop screenshots out of the box
🚀 **Zero Config**: Works with your existing router setup
🗑️ **Clean Exit**: `npx protobooth cleanup` when you're done

## Requirements

- React 18+ (works with any React framework)
- Modern browser for client reviews
- Staging server for deployment (any static host works)

## Self-Destruct

When prototyping is complete:

```bash
npx protobooth cleanup
```

This removes all protobooth files, configurations, and dependencies while preserving your feedback history for documentation.

## Contributing

protobooth is in active development. We welcome contributions that align with our simplicity-first philosophy.

## License

MIT

---

## 🚀 Ready to 10x Your Prototype Reviews?

Stop wasting hours on manual screenshots. Join the developers who've already discovered the smart way to handle client feedback.

```bash
npm install protobooth
```

**Questions? Issues? Ideas?** We're building protobooth in the open at [github.com/protobooth/protobooth](https://github.com/protobooth/protobooth)

_Built for developers, by developers, in 2025_ 🛠️
