# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure and architecture
- Automatic route discovery for Vite + TanStack Router
- Automatic route discovery for Next.js App Router
- Screenshot capture service with Playwright integration
- Fixture management system for mock authentication and dynamic routes
- Multi-viewport screenshot support
- Workflow state management (4 states: in-development, reviews-requested, in-review, submitted-for-development)
- ResolveApp UI for developer workflow
- AnnotateApp UI for client annotation workflow
- File-based state persistence (.protobooth directory)
- Confirmation dialogs for workflow state changes
- Loading overlay during screenshot capture
- Sticky toolbar with workflow-aware action buttons
- TDD test coverage (unit, integration tests)

### In Progress
- E2E workflow tests
- Browser API adapters for production usage
- Annotation download (.zip format)
- Screenshot navigation sidebar

## [0.1.0] - 2025-10-04

### Added
- Initial alpha release
- Core architecture and TDD foundation
- Route discovery for TanStack Router and Next.js
- Screenshot capture with fixture injection
- Basic UI components (ResolveApp, AnnotateApp)
- Workflow state management
- Demo applications for testing

### Notes
- This is an **alpha release** - API is unstable and breaking changes are expected
- Not recommended for production use
- Focused on core feature development and architecture validation
