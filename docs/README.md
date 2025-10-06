# Documentation Index

Welcome to the Automata Wallet documentation. This directory contains all technical documentation, architecture decisions, and development guides.

## 📚 Documentation Structure

### [Architecture](./architecture/)
Architecture Decision Records (ADRs) and technical design documents.

- [ADR-001: Lua Scripting Engine Choice](./architecture/ADR-001-lua-engine.md)
- [ADR-002: Sandbox Security Model](./architecture/ADR-002-sandbox-security.md)
- [ADR-003: Key Management Strategy](./architecture/ADR-003-key-management.md)
- [System Architecture Overview](./architecture/system-architecture.md)

### [API Reference](./api/)
Complete API documentation for Lua scripting.

- [Wallet API](./api/wallet-api.md) - Balance queries, address management
- [Contract API](./api/contract-api.md) - Read/write smart contract interactions
- [Network API](./api/network-api.md) - Blockchain network operations
- [HTTP API](./api/http-api.md) - External data fetching
- [Utilities API](./api/utilities-api.md) - Helper functions

### [Security](./security/)
Security model, threat analysis, and audit reports.

- [Security Model](./security/security-model.md)
- [Threat Model](./security/threat-model.md)
- [Sandbox Implementation](./security/sandbox-implementation.md)
- [Audit Reports](./security/audits/) (Post-Phase 5)

### [Development Guides](./guides/)
Practical guides for contributors and developers.

- [Getting Started](./guides/getting-started.md)
- [Project Structure](./guides/project-structure.md)
- [Testing Guide](./guides/testing-guide.md)
- [Deployment Guide](./guides/deployment-guide.md)
- [Contributing Guidelines](./guides/contributing.md)

### [Examples](./examples/)
Example Lua scripts demonstrating wallet capabilities.

- [Portfolio Tracker](./examples/portfolio-tracker.lua)
- [Price Alert Bot](./examples/price-alert.lua)
- [Gas Monitor](./examples/gas-monitor.lua)
- [Token Balance Checker](./examples/token-balance.lua)

## 🚀 Quick Links

- [Main README](../README.md)
- [Security Policy](../SECURITY.md)
- [Phase 0 Roadmap](./roadmap/phase-0.md)
- [WASM-Lua PoC Results](./architecture/wasm-lua-poc.md)

## 📝 Contributing to Docs

Documentation improvements are always welcome! Please follow these guidelines:

1. Use clear, concise language
2. Include code examples where applicable
3. Update the index when adding new docs
4. Run spell check before committing
5. Follow Markdown best practices

## 📅 Documentation Status

| Section | Status | Last Updated |
|---------|--------|--------------|
| Architecture | 🟡 In Progress | Oct 2025 |
| API Reference | 🔴 Not Started | - |
| Security | 🟡 In Progress | Oct 2025 |
| Guides | 🟡 In Progress | Oct 2025 |
| Examples | 🔴 Not Started | - |

Legend: 🟢 Complete | 🟡 In Progress | 🔴 Not Started
