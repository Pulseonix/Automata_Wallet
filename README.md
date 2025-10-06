# 🤖 Automata Wallet

**A programmable crypto wallet with Lua scripting capabilities**

> ⚠️ **SECURITY NOTICE**: This project is currently in Phase 0 (Foundation) development. Do NOT use with real funds until security audit is complete.

## 🎯 Vision

Automata Wallet empowers users to automate and customize their crypto experience through secure, sandboxed Lua scripts. Think of it as "Tasker for Web3" - enabling everything from portfolio tracking to automated trading strategies.

## 🏗️ Project Status

**Current Phase:** Phase 0 - Foundation & Technical Validation (Week 1/3)

### Completed Milestones
- [ ] Project & Infrastructure Setup
- [ ] WASM-Lua Proof of Concept
- [ ] Go/No-Go Decision

### Development Timeline
- **Phase 0:** Foundation & Technical Validation (3 weeks) ← We are here
- **Phase 1:** Secure Core Wallet (5 weeks)
- **Phase 2:** Enhanced Wallet Features (3 weeks)
- **Phase 3:** Lua Scripting Foundation (5 weeks)
- **Phase 4:** State-Changing Operations (3 weeks)
- **Phase 5:** Security Hardening (3 weeks)
- **Phase 6:** Beta Preparation (2 weeks)
- **Phase 7:** Beta Launch & Iteration (6+ weeks)

**Estimated Beta Launch:** 24 weeks from project start

## 🔐 Security First

Security is our top priority. Our approach:

- ✅ Sandboxed script execution (WASM + Web Workers)
- ✅ User approval required for all state changes
- ✅ WebCrypto API for encryption (AES-GCM)
- ✅ BIP-39/BIP-44 standard compliance
- ✅ External security audit planned (Phase 5)
- ✅ Bug bounty program post-launch
- ✅ Content Security Policy (CSP) enforcement
- ✅ No external network access without explicit permission

## 🚀 Core Features (Planned)

### Phase 1-2: Basic Wallet
- Create/import wallet from seed phrase
- Send/receive ETH and ERC-20 tokens
- Transaction history
- Multi-network support (Ethereum, testnets)
- Portfolio tracking with USD values

### Phase 3-4: Lua Scripting
- Monaco-based script editor with syntax highlighting
- Read-only API (balances, contract reads, network data)
- State-changing API (transactions with user approval)
- Script templates and examples
- Real-time execution console

### Future (Post-Beta)
- Multi-chain support (Polygon, Base, Arbitrum, etc.)
- Script marketplace
- Scheduled script execution
- Mobile app
- Team/shared wallets

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Blockchain:** ethers.js v6
- **Scripting:** Lua (WASM-compiled via Fengari/Emscripten)
- **Extension:** Chrome Manifest V3
- **Testing:** Vitest + Testing Library
- **CI/CD:** GitHub Actions
- **Error Tracking:** Sentry
- **Security:** WebCrypto API, CSP headers

## 📦 Project Structure

```
automata-wallet/
├── src/
│   ├── background/       # Service worker (MV3)
│   ├── content/          # Content scripts
│   ├── popup/            # Extension popup UI
│   ├── components/       # Shared React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Core libraries
│   │   ├── crypto/       # Key management, encryption
│   │   ├── wallet/       # Wallet operations
│   │   ├── lua/          # Lua sandbox integration
│   │   └── api/          # Lua API implementation
│   ├── types/            # TypeScript definitions
│   └── utils/            # Helper functions
├── public/               # Static assets
├── docs/                 # Documentation
│   ├── architecture/     # ADRs and design docs
│   ├── api/              # Lua API reference
│   ├── security/         # Security model & audits
│   └── guides/           # Development guides
├── scripts/              # Build and deployment scripts
├── tests/                # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── wasm/                 # WASM modules (Lua)
```

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Chrome/Chromium browser

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/automata-wallet.git
cd automata-wallet

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint
```

### Loading Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `dist/` folder from the project

## 🧪 Testing Strategy

- **Unit Tests:** Critical crypto and wallet operations (100% coverage goal)
- **Integration Tests:** Lua sandbox, API bridge, transaction flows
- **E2E Tests:** Full user workflows with Playwright
- **Security Tests:** Sandbox escape attempts, XSS, injection attacks
- **Performance Tests:** Script execution benchmarks, memory profiling

## 🤝 Contributing

This project is currently in early development. Contributions will be welcome after Phase 3 (Lua Scripting Foundation) is complete.

### Contribution Guidelines (Coming Soon)
- Code style enforcement via ESLint + Prettier
- All PRs require passing tests and security checks
- Security-sensitive changes require review by 2+ maintainers

## 📋 Branch Protection Rules (Recommended)

For production repository:

```yaml
main:
  - Require pull request reviews (2 approvers for security-critical code)
  - Require status checks to pass (CI, tests, linting, security scan)
  - Require branches to be up to date
  - Require signed commits
  - No force pushes
  - No deletions

develop:
  - Require pull request reviews (1 approver)
  - Require status checks to pass
  - Require branches to be up to date
```

## 📄 License

[TBD - Likely MIT or Apache 2.0 after beta]

## 🔗 Links

- **Documentation:** [Coming Soon]
- **Discord:** [Coming Soon]
- **Security Policy:** [Coming Soon]
- **Bug Bounty:** [Coming Soon - Post Security Audit]

## ⚠️ Disclaimer

This software is provided "as is" without warranty. Users are responsible for:
- Securely backing up their seed phrases
- Understanding the risks of automated trading
- Verifying script behavior before execution
- Never sharing private keys or seed phrases

**NEVER use this wallet with significant funds during beta testing.**

---

Built with ❤️ for the Web3 community
