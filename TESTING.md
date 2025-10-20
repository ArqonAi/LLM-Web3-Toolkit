# Testing Documentation

## Test Structure

```
tests/
├── unit/           # Unit tests for individual functions
├── integration/    # Integration tests for module interaction
└── e2e/           # End-to-end tests for complete workflows
```

## Test Categories

### Unit Tests
- Wallet manager operations
- Chain configuration validation
- Function schema validation
- Type checking

### Integration Tests
- Wallet + Chain interaction
- Function execution flow
- Error handling across modules

### E2E Tests
- Complete wallet connection flow
- LLM function calling with OpenAI
- LLM function calling with Anthropic
- Multi-chain operations
- Transaction lifecycle

## Running Tests

```bash
# All tests
npm test

# Specific test suite
npm test -- wallet-connection

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Test Requirements

### Testnet Testing
- Sepolia ETH faucet: https://sepoliafaucet.com
- Test wallet required for transaction tests
- RPC endpoints must be accessible

### Mock Environment
- MetaMask provider mocked for unit tests
- Real testnet for E2E validation

## Coverage Targets

- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Release tags

## Security Testing

- Address validation tests
- Transaction simulation tests
- Gas estimation accuracy
- Signature verification
