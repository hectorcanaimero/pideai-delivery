# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application using the App Router, TypeScript, React 19, and Tailwind CSS v4. The project was bootstrapped with `create-next-app` and uses pnpm as the package manager.

## Essential Commands

### Development
```bash
pnpm dev          # Start development server on http://localhost:3000
pnpm build        # Create production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Testing
No test framework is currently configured in this project.

## Architecture

### Directory Structure
- `src/app/` - Next.js App Router directory
  - `layout.tsx` - Root layout with Geist font configuration
  - `page.tsx` - Home page component
  - `globals.css` - Global styles with Tailwind directives
  - `favicon.ico` - Site favicon
- `public/` - Static assets (images, SVGs)

### Key Configuration

**TypeScript Configuration (`tsconfig.json`):**
- Path alias `@/*` maps to `./src/*` for clean imports
- Target: ES2017
- Strict mode enabled
- Module resolution: bundler

**Next.js Configuration (`next.config.ts`):**
- Currently using default configuration
- TypeScript config file

**Styling:**
- Tailwind CSS v4 with PostCSS plugin
- Custom fonts: Geist Sans and Geist Mono loaded via `next/font/google`
- Dark mode support using Tailwind's `dark:` prefix

**ESLint Configuration (`eslint.config.mjs`):**
- Uses Next.js recommended rules for web vitals and TypeScript
- Flat config format with `defineConfig`
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Development Notes

### App Router Conventions
- Server Components by default (no 'use client' needed unless using hooks/interactivity)
- File-based routing in `src/app/`
- Root `layout.tsx` wraps all pages and configures fonts/metadata

### Import Best Practices
- Use `@/` prefix for imports from `src/` directory
  - Example: `import Component from '@/components/Component'`
- Use Next.js optimized components (`next/image`, `next/font`, etc.)

### Styling
- Tailwind v4 uses PostCSS plugin (configured in `postcss.config.mjs`)
- Global styles defined in `src/app/globals.css`
- Font variables available: `--font-geist-sans`, `--font-geist-mono`
