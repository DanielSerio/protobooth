# Versioning Strategy

This document defines how protobooth versions are managed, what constitutes breaking changes, and how to communicate version updates to users.

## Core Principles

1. **Semantic Versioning (SemVer)** - Follow `MAJOR.MINOR.PATCH` format strictly
2. **Simplicity First** - Clear, predictable versioning that developers understand immediately
3. **Disposable Tool Mindset** - Versions are temporary; breaking changes are acceptable when justified
4. **Transparent Communication** - Always communicate what changed and why

---

## Version Format

### Standard Releases

```
MAJOR.MINOR.PATCH
```

**Examples:**
- `1.0.0` - Initial stable release
- `1.1.0` - New feature (fixture enhancements)
- `1.1.1` - Bug fix (screenshot capture error)
- `2.0.0` - Breaking change (new workflow state structure)

### Pre-Release Versions

```
MAJOR.MINOR.PATCH-LABEL.NUMBER
```

**Labels:**
- `alpha` - Early development, unstable, frequent changes
- `beta` - Feature complete, testing phase, stabilizing
- `rc` - Release candidate, production-ready testing

**Examples:**
- `1.0.0-alpha.1` - First alpha release
- `1.0.0-beta.2` - Second beta release
- `2.0.0-rc.1` - Release candidate for v2

---

## Version Increment Rules

### MAJOR (Breaking Changes)

**Increment when:**
- API interface changes (function signatures, props, exports)
- Configuration format changes (vite.config.ts / next.config.js)
- File structure changes (.protobooth directory layout)
- Workflow state changes (state names, transitions)
- Minimum Node.js or framework version requirements change
- Removal of supported features

**Examples:**
```typescript
// BREAKING: Changed prop name (v1 → v2)
// v1:
<ResolveApp config={...} />
// v2:
<ResolveApp settings={...} />

// BREAKING: Changed workflow states (v1 → v2)
// v1: 'in-development' | 'reviews-requested' | 'in-review' | 'submitted-for-development'
// v2: 'development' | 'pending-review' | 'reviewing' | 'resolved'

// BREAKING: Changed fixture format (v1 → v2)
// v1:
fixtures: { auth: { user: {...} } }
// v2:
fixtures: { authentication: { user: {...} } }
```

### MINOR (New Features)

**Increment when:**
- New optional configuration options
- New workflow features (without changing existing states)
- New UI components or tools
- New router support (e.g., adding Remix support)
- New export formats (e.g., adding PDF export)
- New optional dependencies

**Examples:**
```typescript
// FEATURE: Added optional viewport configuration (v1.0 → v1.1)
protobooth({
  fixtures: {...},
  viewports: [{ name: 'mobile', width: 375, height: 667 }] // NEW
})

// FEATURE: Added annotation priority levels (v1.1 → v1.2)
interface Annotation {
  id: string;
  content: string;
  priority: 'low' | 'medium' | 'high'; // NEW
}
```

### PATCH (Bug Fixes)

**Increment when:**
- Bug fixes (no API changes)
- Performance improvements
- Documentation corrections
- Internal refactoring (no external impact)
- Dependency updates (patch-level only)
- Error message improvements

**Examples:**
```typescript
// FIX: Screenshot capture now handles dynamic routes correctly (v1.1.0 → v1.1.1)
// FIX: Workflow state persistence race condition (v1.1.1 → v1.1.2)
// FIX: TypeScript type inference for fixtures (v1.1.2 → v1.1.3)
```

---

## Pre-Release Lifecycle

### Alpha Phase (`0.x.x-alpha.N`)

**Purpose:** Early development, rapid iteration, major API changes expected

**Characteristics:**
- API unstable, breaking changes frequent
- Core features being built
- Limited testing
- Not recommended for production use

**Duration:** Until all core features implemented

**Release Frequency:** As needed (multiple per week)

**Example:**
```
0.1.0-alpha.1  - Initial route discovery
0.1.0-alpha.2  - Added fixture injection
0.2.0-alpha.1  - Added screenshot capture
```

### Beta Phase (`0.x.x-beta.N` or `1.0.0-beta.N`)

**Purpose:** Feature-complete, stabilization, bug fixing

**Characteristics:**
- All core features implemented
- API stabilizing (minor changes only)
- Comprehensive testing
- Community feedback encouraged

**Duration:** 2-4 weeks

**Release Frequency:** Weekly

**Example:**
```
1.0.0-beta.1  - Feature complete
1.0.0-beta.2  - Bug fixes from testing
1.0.0-beta.3  - Final API adjustments
```

### Release Candidate (`1.0.0-rc.N`)

**Purpose:** Production-ready testing, final validation

**Characteristics:**
- No new features
- Bug fixes only
- Extensive testing
- Documentation complete

**Duration:** 1-2 weeks

**Release Frequency:** As needed

**Example:**
```
1.0.0-rc.1  - Release candidate
1.0.0-rc.2  - Critical bug fix
1.0.0       - Stable release
```

---

## Special Considerations for Protobooth

### "Disposable Tool" Versioning Philosophy

Protobooth is designed to be **installed, used, then removed**. This unique characteristic affects versioning decisions:

**Implications:**

1. **Breaking Changes Are Acceptable**
   - Users install protobooth temporarily for each prototype
   - Each project can use different versions
   - No long-term upgrade path required
   - Less pressure to maintain backwards compatibility

2. **Version Lock Recommended**
   ```json
   {
     "devDependencies": {
       "protobooth": "1.2.0"  // Exact version, not ^1.2.0
     }
   }
   ```

3. **Clear Cleanup Communication**
   - Each major version should document cleanup process
   - Migration guides when breaking changes occur
   - Cleanup command compatibility across versions

### Data Format Versioning

The `.protobooth/` directory contains data files that may need versioning:

**Version Metadata in Files:**

```json
{
  "version": "1.0.0",
  "state": "in-review",
  "timestamp": "2025-10-04T12:00:00Z",
  "data": {...}
}
```

**Benefits:**
- Detect version mismatches
- Warn users about incompatible data
- Enable migration tools if needed

**Example Version Check:**

```typescript
// src/core/version-check.ts
export function checkDataVersion(dataVersion: string): void {
  const currentVersion = packageJson.version;
  const dataMajor = parseInt(dataVersion.split('.')[0]);
  const currentMajor = parseInt(currentVersion.split('.')[0]);

  if (dataMajor !== currentMajor) {
    throw new Error(
      `Incompatible data version. Expected ${currentMajor}.x.x, found ${dataVersion}. ` +
      `Run 'npx protobooth cleanup' and start fresh.`
    );
  }
}
```

---

## Version Communication

### Changelog (CHANGELOG.md)

**Format:** Keep a Changelog (keepachangelog.com)

**Structure:**
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature descriptions

### Changed
- Changes to existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security fixes

## [1.2.0] - 2025-10-15

### Added
- Support for Remix router
- PDF annotation export

### Fixed
- Screenshot capture timeout on slow networks

## [1.1.0] - 2025-10-01

### Added
- Multi-viewport screenshot support
- Custom viewport configuration
```

### Migration Guides

**Create for each MAJOR version:**

```markdown
# Migration Guide: v1 → v2

## Breaking Changes

### 1. Configuration Format Change

**Before (v1):**
```typescript
protobooth({
  fixtures: { auth: {...} }
})
```

**After (v2):**
```typescript
protobooth({
  fixtures: { authentication: {...} }
})
```

**Migration Steps:**
1. Update `vite.config.ts` or `next.config.js`
2. Rename `auth` to `authentication` in fixtures
3. Run `npx protobooth cleanup` to remove v1 data
4. Reinstall: `npm install protobooth@2.0.0`
```

### Release Notes

**Include in GitHub releases:**
- Summary of changes
- Breaking changes highlighted
- Migration steps
- Known issues
- Contributors

---

## Version Checking

### Runtime Version Check

**Display version in UI:**

```typescript
// src/ui/Core/components/Layout.tsx
<footer>
  <small>protobooth v{packageJson.version}</small>
</footer>
```

### CLI Version Command

```bash
$ npx protobooth --version
protobooth v1.2.0

$ npx protobooth version
protobooth: 1.2.0
node: 18.17.0
vite: 5.0.0
next: 14.0.0
```

### Update Notifications

**Check for newer versions:**

```typescript
// src/cli/update-check.ts
export async function checkForUpdates(): Promise<void> {
  const currentVersion = packageJson.version;
  const latestVersion = await fetchLatestVersion('protobooth');

  if (semver.gt(latestVersion, currentVersion)) {
    console.log(`
      ⚠️  A new version of protobooth is available!
      Current: ${currentVersion}
      Latest:  ${latestVersion}

      Update: npm install protobooth@latest
    `);
  }
}
```

---

## Release Process

### Pre-Release Checklist

- [ ] All tests passing (unit, integration, E2E)
- [ ] Documentation updated (README, CHANGELOG, migration guides)
- [ ] Version bumped in package.json
- [ ] Git tag created (`git tag v1.2.0`)
- [ ] Build artifacts verified
- [ ] Demo apps tested with new version

### Release Steps

1. **Update Version**
   ```bash
   npm version major|minor|patch  # Updates package.json + creates git tag
   ```

2. **Update Changelog**
   ```bash
   # Move [Unreleased] items to new version section
   vim CHANGELOG.md
   ```

3. **Commit and Tag**
   ```bash
   git add .
   git commit -m "Release v1.2.0"
   git tag v1.2.0
   git push origin main --tags
   ```

4. **Publish to NPM**
   ```bash
   npm publish  # For stable releases
   npm publish --tag beta  # For beta releases
   npm publish --tag alpha  # For alpha releases
   ```

5. **Create GitHub Release**
   - Go to Releases → Draft a new release
   - Select tag
   - Copy changelog content
   - Add migration guide link if breaking changes
   - Publish

### Post-Release

- [ ] Announce on social media / blog
- [ ] Update demos to use new version
- [ ] Monitor for issues
- [ ] Respond to bug reports within 48 hours

---

## Deprecation Policy

### Deprecation Timeline

**Minimum timeline for deprecated features:**
- Announce deprecation in MINOR version
- Maintain for at least 1 MAJOR version
- Remove in next MAJOR version

**Example:**
```
v1.2.0 - Feature X deprecated (warning added)
v1.3.0 - Feature X still works (warning remains)
v2.0.0 - Feature X removed (breaking change)
```

### Deprecation Warnings

```typescript
// Example deprecation warning
export function oldFeature() {
  console.warn(
    '[DEPRECATED] oldFeature() is deprecated and will be removed in v2.0.0. ' +
    'Use newFeature() instead. See migration guide: https://...'
  );
  // ... implementation
}
```

---

## Version Support Policy

### Active Support

**Only the latest MAJOR version receives active support:**
- Bug fixes
- Security patches
- New features

**Example:**
- v2.x.x (current) - Full support
- v1.x.x (previous) - Security patches only for 6 months
- v0.x.x (beta) - No support

### Security Updates

**Critical security vulnerabilities:**
- Patched in current MAJOR version immediately
- Backported to previous MAJOR version if within 6 months
- Announced via GitHub Security Advisory

---

## Versioning Tools

### Recommended NPM Scripts

```json
{
  "scripts": {
    "version:patch": "npm version patch",
    "version:minor": "npm version minor",
    "version:major": "npm version major",
    "version:alpha": "npm version prerelease --preid=alpha",
    "version:beta": "npm version prerelease --preid=beta",
    "version:rc": "npm version prerelease --preid=rc",
    "release": "npm run test && npm run build && npm publish",
    "release:beta": "npm run test && npm run build && npm publish --tag beta"
  }
}
```

### Semantic Release (Optional)

**For automated versioning:**

```bash
npm install --save-dev semantic-release
```

**Benefits:**
- Automatic version bumping based on commit messages
- Automatic changelog generation
- Automatic NPM publishing
- Consistent release process

**Commit Message Format:**
```
feat: add multi-viewport support     → MINOR bump
fix: resolve screenshot timeout      → PATCH bump
feat!: change workflow state names   → MAJOR bump
```

---

## Current Version Status

**Latest Stable:** Not yet released
**Current Phase:** Alpha development (`0.x.x-alpha`)
**Target v1.0.0:** TBD (when core features complete)

**Development Roadmap:**
- `0.1.0-alpha.x` - Route discovery + fixtures
- `0.2.0-alpha.x` - Screenshot capture
- `0.3.0-alpha.x` - Annotation UI
- `0.4.0-alpha.x` - Resolution workflow
- `1.0.0-beta.1` - Feature complete, stabilization
- `1.0.0-rc.1` - Production testing
- `1.0.0` - Stable release

---

## Decision Summary

**Key Versioning Decisions:**

1. ✅ **Use Semantic Versioning** - Industry standard, well understood
2. ✅ **Breaking changes acceptable** - Disposable tool, no long-term compatibility burden
3. ✅ **Version metadata in data files** - Detect incompatibilities early
4. ✅ **Exact version locking** - Prevent unexpected breaking changes
5. ✅ **Clear migration guides** - Support users through major upgrades
6. ✅ **Active support for latest major only** - Focus resources, maintain simplicity
7. ✅ **Transparent communication** - Changelog, release notes, deprecation warnings

All decisions align with core principles: **Simplicity First**, **Clear Communication**, **User Experience**.
