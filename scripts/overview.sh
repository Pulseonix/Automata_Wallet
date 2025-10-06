#!/bin/bash

# Project Overview Script
# Displays key information about the Automata Wallet project

echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║          🤖 AUTOMATA WALLET - PROJECT OVERVIEW          ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Count files by type
echo "📊 PROJECT STATISTICS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

total_files=$(find . -type f -not -path './node_modules/*' -not -path './.git/*' | wc -l)
ts_files=$(find ./src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
doc_files=$(find ./docs -name "*.md" 2>/dev/null | wc -l)
config_files=$(find . -maxdepth 1 -name "*.json" -o -name "*.js" -o -name "*.cjs" -o -name "*.ts" 2>/dev/null | wc -l)

echo "Total Files:        $total_files"
echo "TypeScript Files:   $ts_files"
echo "Documentation:      $doc_files"
echo "Config Files:       $config_files"
echo ""

# Phase status
echo "🎯 PHASE STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 0.1: Project Setup         ✅ COMPLETE"
echo "Phase 0.2: WASM-Lua PoC          ⏳ IN PROGRESS"
echo "Phase 1:   Core Wallet           ⏸️  PENDING"
echo "Phase 2:   Enhanced Features     ⏸️  PENDING"
echo "Phase 3:   Lua Scripting         ⏸️  PENDING"
echo "Phase 4:   State Changes         ⏸️  PENDING"
echo "Phase 5:   Security Hardening    ⏸️  PENDING"
echo "Phase 6:   Beta Prep             ⏸️  PENDING"
echo "Phase 7:   Beta Launch           ⏸️  PENDING"
echo ""

# Features checklist
echo "✅ COMPLETED FEATURES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Vite + React + TypeScript setup"
echo "✓ Chrome Extension Manifest V3"
echo "✓ CI/CD pipeline (GitHub Actions)"
echo "✓ Tailwind CSS styling system"
echo "✓ ESLint + Prettier configuration"
echo "✓ Vitest testing infrastructure"
echo "✓ Error tracking with Sentry"
echo "✓ Comprehensive documentation"
echo "✓ Security architecture designed"
echo "✓ Key management strategy (ADR)"
echo "✓ Sandbox security model (ADR)"
echo "✓ Lua engine evaluation (ADR)"
echo ""

# Key documents
echo "📚 KEY DOCUMENTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "README.md                        - Project overview"
echo "SETUP_COMPLETE.md                - Setup guide & status"
echo "SECURITY.md                      - Security policy"
echo "CONTRIBUTING.md                  - Contribution guidelines"
echo "docs/architecture/ADR-001-*.md   - Lua engine decision"
echo "docs/architecture/ADR-002-*.md   - Sandbox security"
echo "docs/architecture/ADR-003-*.md   - Key management"
echo "docs/guides/getting-started.md   - Developer guide"
echo ""

# Quick commands
echo "⚡ QUICK COMMANDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "pnpm install        Install dependencies"
echo "pnpm dev            Start development server"
echo "pnpm build          Build for production"
echo "pnpm test           Run tests"
echo "pnpm lint           Check code quality"
echo "pnpm type-check     Validate TypeScript"
echo ""

# Next steps
echo "🚀 NEXT STEPS (PHASE 0.2)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Install Fengari: npm install fengari"
echo "2. Install lua.vm.js: npm install lua.vm.js"
echo "3. Create WASM-Lua PoC in wasm/ directory"
echo "4. Run performance benchmarks"
echo "5. Document findings in docs/architecture/wasm-lua-poc.md"
echo "6. Make Go/No-Go decision"
echo ""

# Warnings
echo "⚠️  IMPORTANT WARNINGS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚨 DO NOT USE WITH REAL FUNDS (Alpha software)"
echo "🚨 No security audit yet (scheduled Phase 5)"
echo "🚨 Core wallet features not implemented yet"
echo "🚨 For development and testing only"
echo ""

# Success message
echo "════════════════════════════════════════════════════════════"
echo "✨ Project foundation is ready! Time to build! ✨"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Read SETUP_COMPLETE.md for detailed information."
echo ""
