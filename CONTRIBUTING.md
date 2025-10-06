# Contributing to Automata Wallet

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚧 Current Status

**Phase 0 (Foundation)** - Not yet accepting external contributions

We will open contributions after Phase 3 (Lua Scripting Foundation) is complete. Until then, this document serves as a reference for the core team.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Report security vulnerabilities privately

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

See [Development Guide](./guides/getting-started.md) for detailed setup instructions.

## Pull Request Process

### Before Submitting

- [ ] Tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Code is formatted (`pnpm format`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventions

### PR Guidelines

- **Title:** Use conventional commits format
- **Description:** Explain what and why, not how
- **Tests:** Include tests for new functionality
- **Documentation:** Update relevant docs
- **Breaking Changes:** Clearly marked and justified

### Review Process

1. Automated checks must pass
2. Code review by 1+ maintainers
3. Security review for sensitive changes
4. Approval required before merge

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Build/tooling changes
- `security`: Security improvements

**Examples:**
```
feat(wallet): add ERC-20 token support

Implements token detection, balance fetching, and transfer functionality.

Closes #123
```

```
fix(crypto): prevent key leak in error messages

Previously, error messages could contain fragments of private keys.
Now all errors are sanitized before logging.

Security impact: High
```

## Development Standards

### Code Quality

- **TypeScript:** Strict mode, no `any`
- **Testing:** >80% coverage for new code
- **Documentation:** All public APIs documented
- **Performance:** No unnecessary re-renders or computations

### Security Requirements

- Never log sensitive data (keys, seeds, passwords)
- Validate all user inputs
- Use constant-time comparisons for secrets
- Follow OWASP guidelines
- Get security review for crypto code

### Testing Requirements

```typescript
// Every new feature needs:
describe('Feature', () => {
  it('should work correctly', () => {
    // Happy path test
  });

  it('should handle errors', () => {
    // Error case test
  });

  it('should validate inputs', () => {
    // Input validation test
  });
});
```

## Areas for Contribution (Future)

### High Priority
- 🔐 Security improvements
- 🐛 Bug fixes
- 📚 Documentation
- ✅ Test coverage

### Medium Priority
- 🎨 UI/UX improvements
- ⚡ Performance optimizations
- 🌐 Internationalization
- ♿ Accessibility

### Low Priority
- 🎭 New features (discuss first)
- 🔧 Developer tooling
- 📊 Analytics

## Issue Guidelines

### Reporting Bugs

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen.

**Screenshots**
If applicable.

**Environment:**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 120]
- Extension version: [e.g. 0.1.0]
```

### Feature Requests

```markdown
**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
What other options did you consider?

**Additional Context**
Any other relevant information.
```

### Security Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.

Email: security@automata-wallet.io (setup pending)

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

## Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file
- Release notes
- Project README

Significant contributors may be invited to join the core team.

## Questions?

- Read the [documentation](../README.md)
- Check [existing issues](https://github.com/yourusername/automata-wallet/issues)
- Ask in Discord (coming soon)

---

Thank you for contributing to Automata Wallet! 🤖
