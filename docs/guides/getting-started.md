# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 8+ (or npm/yarn)
- Chrome/Chromium browser
- Git
- Code editor (VS Code recommended)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/yourusername/automata-wallet.git
cd automata-wallet

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Loading Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `dist/` folder from the project
5. The extension should now appear in your browser

### Hot Reload

Changes to most files will automatically reload the extension. For changes to:
- `manifest.json`: Manual reload required
- Service worker: Click refresh icon in `chrome://extensions/`
- Content scripts: Reload the webpage

## Project Structure

```
automata-wallet/
├── .github/
│   └── workflows/         # CI/CD pipelines
├── docs/                  # Documentation
│   ├── architecture/      # ADRs and technical docs
│   ├── api/              # API reference
│   ├── security/         # Security documentation
│   └── guides/           # Development guides
├── public/               # Static assets
│   └── icons/           # Extension icons
├── src/
│   ├── background/      # Service worker (MV3)
│   │   └── index.ts
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Core libraries
│   │   ├── crypto/     # Key management
│   │   ├── wallet/     # Wallet operations
│   │   ├── lua/        # Lua sandbox
│   │   └── api/        # Lua API implementation
│   ├── popup/          # Extension popup
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── types/          # TypeScript types
│   ├── utils/          # Helper functions
│   └── index.css       # Global styles
├── tests/              # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── wasm/               # WASM modules
└── manifest.json       # Extension manifest

```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write code following project conventions
- Add tests for new functionality
- Update documentation if needed

### 3. Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/lib/crypto/encryption.test.ts
```

### 4. Lint and Format

```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### 5. Type Check

```bash
pnpm type-check
```

### 6. Build

```bash
pnpm build
```

### 7. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/tooling changes

### 8. Push and Create PR

```bash
git push origin feature/my-feature
```

Then create a Pull Request on GitHub.

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` type (use `unknown` if needed)
- Use explicit return types for functions
- Prefer `const` over `let`

```typescript
// ✅ Good
function calculateBalance(amounts: bigint[]): bigint {
  return amounts.reduce((sum, amount) => sum + amount, 0n);
}

// ❌ Bad
function calculateBalance(amounts: any): any {
  let sum = 0;
  for (let i = 0; i < amounts.length; i++) {
    sum = sum + amounts[i];
  }
  return sum;
}
```

### React

- Use functional components with hooks
- Use TypeScript interfaces for props
- Keep components small and focused
- Use custom hooks for reusable logic

```typescript
// ✅ Good
interface WalletBalanceProps {
  address: string;
  balance: bigint;
}

export function WalletBalance({ address, balance }: WalletBalanceProps) {
  const formattedBalance = formatEther(balance);
  
  return (
    <div className="card">
      <p>{address}</p>
      <p>{formattedBalance} ETH</p>
    </div>
  );
}
```

### Naming Conventions

- Components: `PascalCase` (e.g., `WalletBalance`)
- Files: `kebab-case` (e.g., `wallet-balance.tsx`)
- Functions: `camelCase` (e.g., `calculateBalance`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_GAS_LIMIT`)
- Types/Interfaces: `PascalCase` (e.g., `TransactionRequest`)

## Testing

### Unit Tests

Test individual functions and components:

```typescript
import { describe, it, expect } from 'vitest';
import { formatEther } from './format';

describe('formatEther', () => {
  it('should format wei to ether', () => {
    expect(formatEther(1000000000000000000n)).toBe('1.0');
  });

  it('should handle zero', () => {
    expect(formatEther(0n)).toBe('0.0');
  });
});
```

### Integration Tests

Test multiple components working together:

```typescript
import { describe, it, expect } from 'vitest';
import { createWallet, unlockWallet } from './wallet';

describe('Wallet integration', () => {
  it('should create and unlock wallet', async () => {
    const { address, mnemonic } = await createWallet('password123');
    const wallet = await unlockWallet('password123');
    expect(wallet.address).toBe(address);
  });
});
```

### E2E Tests

Test full user workflows (to be added in later phases).

## Debugging

### Console Logging

Use the custom logger:

```typescript
import ErrorLogger from '@/lib/logger';

// Info (development only)
ErrorLogger.logInfo('Balance updated', { balance: '1.5 ETH' });

// Warning
ErrorLogger.logWarning('Low balance', { balance: '0.01 ETH' });

// Error (goes to Sentry in production)
ErrorLogger.log(new Error('Transaction failed'), { txHash: '0x...' });
```

### Chrome DevTools

- **Popup:** Right-click extension icon → Inspect popup
- **Background:** Go to `chrome://extensions/` → Click "Service worker"
- **Console:** Check for errors and logs

### React DevTools

Install React DevTools extension for component inspection.

## Environment Variables

Create `.env.local` (never commit this):

```bash
# Sentry (optional, for error tracking)
VITE_SENTRY_DSN=https://...

# RPC endpoints (optional, defaults provided)
VITE_ETHEREUM_RPC=https://mainnet.infura.io/v3/YOUR_KEY
VITE_SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_KEY
```

## Common Tasks

### Adding a New Component

```bash
# Create component file
touch src/components/my-component.tsx

# Create test file
touch src/components/my-component.test.tsx
```

### Adding a New Dependency

```bash
pnpm add package-name

# or for dev dependency
pnpm add -D package-name
```

### Updating Dependencies

```bash
# Check for updates
pnpm outdated

# Update all
pnpm update

# Update specific package
pnpm update package-name
```

## Troubleshooting

### Extension Not Loading

1. Check console for errors
2. Verify `dist/` folder exists (run `pnpm build`)
3. Try reloading extension in `chrome://extensions/`

### TypeScript Errors

1. Run `pnpm type-check`
2. Check `tsconfig.json` is correct
3. Restart VS Code TypeScript server

### Hot Reload Not Working

1. Restart dev server (`pnpm dev`)
2. Check Vite config
3. Clear Chrome extension cache

### Tests Failing

1. Run `pnpm test -- --no-cache`
2. Check test setup in `tests/setup.ts`
3. Verify mocks are correct

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [ethers.js Documentation](https://docs.ethers.org/)

## Getting Help

- Check existing [GitHub Issues](https://github.com/yourusername/automata-wallet/issues)
- Read the [documentation](../README.md)
- Ask in Discord (coming soon)

---

Happy coding! 🚀
