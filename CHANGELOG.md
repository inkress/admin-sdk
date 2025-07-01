# Changelog

All notable changes to the Inkress Admin SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-07-01

### Added
- Initial release of the Inkress Admin SDK
- TypeScript support with comprehensive type definitions
- Public endpoints for accessing merchant information without authentication
- Full CRUD operations for merchants, products, categories, orders, and users
- Billing plans and subscriptions management
- Automatic retry logic and error handling
- Configurable API endpoints and authentication
- Support for Node.js, browsers, and React Native environments

### Features
- **Public Resource**: Access merchant data, products, and fees without authentication
- **Merchants Resource**: Complete merchant management capabilities
- **Products Resource**: Full product lifecycle management with pagination and filtering
- **Categories Resource**: Category management with hierarchical support
- **Orders Resource**: Order creation, tracking, and status management
- **Users Resource**: User management and role-based access control
- **Billing Plans Resource**: Subscription and payment plan management
- **Subscriptions Resource**: Recurring billing and subscription management

### Security
- JWT-based authentication
- Secure token management
- Support for custom headers and request configuration

### Developer Experience
- Comprehensive TypeScript definitions
- Detailed JSDoc documentation
- Intuitive API design following REST conventions
- Built-in error handling with structured error responses
- Debug logging support for development

## [Unreleased]

### Planned
- Webhook management endpoints
- Enhanced filtering and search capabilities
- Rate limiting utilities
- SDK analytics and monitoring
- Advanced caching strategies
