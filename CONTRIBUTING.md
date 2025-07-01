# Contributing to Inkress Admin SDK

We love contributions from the community! This guide will help you get started with contributing to the Inkress Admin SDK.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature or bugfix
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- TypeScript knowledge
- Familiarity with REST APIs

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/admin-sdk.git
cd admin-sdk

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development mode with watch
npm run dev
```

### Project Structure

```
src/
├── client.ts           # HTTP client and configuration
├── index.ts           # Main SDK export
├── types.ts           # TypeScript type definitions
└── resources/         # API resource implementations
    ├── merchants.ts
    ├── products.ts
    ├── categories.ts
    ├── orders.ts
    ├── users.ts
    ├── billing-plans.ts
    ├── subscriptions.ts
    └── public.ts
```

## Making Changes

### Branching Strategy

- `main` - Production ready code
- `develop` - Integration branch for features
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes

### Coding Standards

- Use TypeScript for all new code
- Follow existing code style and conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Write tests for new functionality

### Adding New Endpoints

When adding a new API endpoint:

1. Add the endpoint method to the appropriate resource class
2. Define TypeScript types for request/response data
3. Add JSDoc documentation with examples
4. Write tests for the new endpoint
5. Update the README with usage examples

Example:

```typescript
// In src/resources/products.ts

/**
 * Search products by text query
 * @param query - Search query string
 * @param options - Additional search options
 */
async search(query: string, options?: SearchOptions): Promise<ApiResponse<Product[]>> {
  return this.client.get<Product[]>('/products/search', { q: query, ...options });
}
```

### TypeScript Types

All new functionality should have proper TypeScript types:

```typescript
// In src/types.ts

export interface SearchOptions {
  category_id?: number;
  price_min?: number;
  price_max?: number;
  limit?: number;
  page?: number;
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- products.test.ts
```

### Writing Tests

- Write unit tests for all new functionality
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

Example test:

```typescript
// tests/resources/products.test.ts

describe('ProductsResource', () => {
  it('should fetch product by ID', async () => {
    const mockProduct = { id: 1, name: 'Test Product' };
    const mockClient = createMockClient(mockProduct);
    const products = new ProductsResource(mockClient);
    
    const result = await products.get(1);
    
    expect(result.data).toEqual(mockProduct);
    expect(mockClient.get).toHaveBeenCalledWith('/products/1');
  });
});
```

## Submitting Changes

### Pull Request Process

1. **Create a Pull Request**
   - Use a clear and descriptive title
   - Reference any related issues
   - Provide a detailed description of changes

2. **Pull Request Template**
   ```markdown
   ## Description
   Brief description of what this PR does.

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tests added/updated
   - [ ] All tests passing
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows project conventions
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] CHANGELOG.md updated
   ```

3. **Review Process**
   - All PRs require at least one review
   - Address feedback promptly
   - Keep PRs focused and reasonably sized

### Commit Guidelines

Use conventional commits for clear history:

```
type(scope): description

feat(products): add search endpoint
fix(auth): handle expired tokens properly
docs(readme): update installation instructions
test(orders): add unit tests for order creation
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

### Release Steps

1. Update version in `package.json`
2. Update `CHANGELOG.md` with new version
3. Create a git tag: `git tag v1.0.1`
4. Push changes: `git push origin main --tags`
5. GitHub Actions will automatically publish to npm

## Getting Help

- 📚 [API Documentation](https://docs.inkress.com)
- 💬 [Discord Community](https://discord.gg/inkress)
- 🐛 [GitHub Issues](https://github.com/inkress/admin-sdk/issues)
- 📧 Email: [dev@inkress.com](mailto:dev@inkress.com)

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes
- Project documentation

Thank you for contributing to the Inkress Admin SDK! 🎉
