# Dashboard Tests

This directory contains tests for the Properlia Dashboard application.

## Test Setup

We use **Vitest** as our testing framework with the following stack:

- **Vitest**: Fast unit test framework
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Custom matchers for DOM testing
- **jsdom**: Browser environment simulation

## Running Tests

### Install Dependencies

First, install the test dependencies:

```bash
npm install
```

### Run Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm test -- --run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Files

### PropertyForm.webp-conversion.test.tsx

Tests the automatic WebP to PNG conversion functionality when uploading images.

**What it tests:**

1. **WebP to PNG Conversion**
   - Converts WebP files to PNG format
   - Renames files with `.png` extension
   - Handles uppercase `.WEBP` extension
   - Sets canvas dimensions correctly
   - Calls conversion API with correct parameters

2. **Error Handling**
   - Handles missing canvas context
   - Handles blob conversion failures
   - Handles image load errors
   - Falls back to original file on error

3. **File Processing**
   - Converts multiple WebP files
   - Preserves non-WebP files unchanged
   - Handles mixed file types correctly
   - Processes files sequentially

4. **File Validation**
   - Validates MIME types
   - Identifies WebP files correctly

## Test Structure

Each test file follows this structure:

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup mocks and test environment
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Specific functionality', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Mocking Strategy

### Canvas API

We mock the Canvas API for image manipulation tests:

```typescript
HTMLCanvasElement.prototype.getContext = () => mockContext;
HTMLCanvasElement.prototype.toBlob = (callback) => callback(mockBlob);
```

### Image Loading

We mock the Image constructor to simulate image loading:

```typescript
global.Image = class MockImage {
  onload: (() => void) | null = null;
  constructor() {
    setTimeout(() => this.onload?.(), 0);
  }
};
```

### URL API

We mock URL.createObjectURL for file handling:

```typescript
global.URL.createObjectURL = () => 'blob:mock-url';
```

## Coverage Goals

We aim for:
- **80%+ statement coverage**
- **75%+ branch coverage**
- **80%+ function coverage**
- **80%+ line coverage**

Check coverage with:

```bash
npm run test:coverage
```

Coverage report will be generated in `coverage/` directory.

## Writing New Tests

### 1. Create Test File

Create a new test file in `__tests__/` directory:

```typescript
// __tests__/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('should render correctly', () => {
    // Test implementation
  });
});
```

### 2. Use Testing Library

For React components, use `@testing-library/react`:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should handle user interaction', async () => {
  render(<MyComponent />);
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### 3. Mock External Dependencies

Use `vi.mock()` for mocking modules:

```typescript
import { vi } from 'vitest';

vi.mock('@/src/services/api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'mock' }))
}));
```

## Best Practices

1. **Descriptive Test Names**: Use clear, descriptive test names
2. **Arrange-Act-Assert**: Follow the AAA pattern
3. **Isolated Tests**: Each test should be independent
4. **Mock External Deps**: Mock API calls, file system, etc.
5. **Test User Behavior**: Test what users do, not implementation details
6. **Clean Up**: Always clean up after tests (done automatically by setup)

## Debugging Tests

### Run Single Test File

```bash
npm test PropertyForm.webp-conversion.test.tsx
```

### Run Single Test

```bash
npm test -t "should convert WebP file to PNG format"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test"],
  "console": "integratedTerminal"
}
```

## CI/CD Integration

Tests run automatically in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run tests
  run: npm test -- --run --coverage
```

## Troubleshooting

### Tests Failing with Canvas Errors

If you see canvas-related errors, ensure `vitest.setup.ts` is properly configured with Canvas API mocks.

### Tests Timing Out

Increase timeout in test:

```typescript
it('long running test', async () => {
  // Test implementation
}, 10000); // 10 second timeout
```

### Import Errors

Check path aliases in `vitest.config.ts`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './'),
  },
}
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update this README if needed
