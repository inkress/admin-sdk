# Changelog

All notable changes to the Inkress Commerce WordPress plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-05

### Added
- Initial release of Inkress Commerce WordPress plugin
- Product management interface in WordPress admin
  - Create products with title, price, permalink, description, and image
  - Edit existing products
  - Delete products with confirmation
  - List all products in table view with pagination support
- Order management interface
  - View all Inkress orders in WordPress admin
  - Display order ID, customer, total, status, and date
  - Pagination for browsing large order lists
  - Responsive table layout
- Frontend display capabilities
  - `[inkress_products]` shortcode for product grid display
  - `[inkress_product id="X"]` shortcode for single product display
  - Responsive CSS styling for product cards
  - Customizable product grid layout
- API integration
  - Secure connection to Inkress API
  - Support for both sandbox and production environments
  - JWT Bearer token authentication
  - Client-Id header support for merchant identification
  - Error handling with WordPress WP_Error
- Settings interface
  - API key configuration
  - Store ID configuration
  - Environment selector (sandbox/production)
  - Settings validation and sanitization
- Security features
  - WordPress nonce verification for all form submissions
  - User capability checks (manage_options)
  - Input sanitization for all user data
  - Output escaping for XSS prevention
  - CSRF protection
- Developer features
  - Internationalization ready (text domain: inkress-commerce)
  - WordPress coding standards compliance
  - Extensive inline documentation
  - Clean, modular code structure
  - Filter hooks for customization

### Technical Details
- Minimum WordPress version: 5.8
- Minimum PHP version: 7.4
- Tested up to WordPress: 6.4
- License: MIT

### Files Included
- `inkress-commerce.php` - Main plugin file
- `includes/class-inkress-api.php` - API client wrapper
- `includes/class-inkress-admin.php` - Admin interface handler
- `includes/class-inkress-frontend.php` - Frontend display handler
- `readme.txt` - WordPress.org readme file
- `INSTALLATION.md` - Installation and setup guide
- `CHANGELOG.md` - This file

### API Endpoints Used
- GET `/products` - List products
- GET `/products/{id}` - Get single product
- POST `/products` - Create product
- PUT `/products/{id}` - Update product
- DELETE `/products/{id}` - Delete product
- GET `/orders` - List orders with pagination

## [Unreleased]

### Planned Features
- [ ] Search and filter functionality for products admin
- [ ] Bulk actions for products (delete multiple)
- [ ] Order detail view page
- [ ] Order status update capability
- [ ] Category management integration
- [ ] Payment link generation
- [ ] Webhook receiver for real-time updates
- [ ] Customer management interface
- [ ] Analytics dashboard widget
- [ ] Export orders to CSV
- [ ] WordPress media library integration for product images
- [ ] Gutenberg blocks for product display
- [ ] Product variations support
- [ ] Inventory management display
- [ ] Email notifications configuration
- [ ] Currency selector in settings
- [ ] Automatic plugin updates

### Under Consideration
- WooCommerce synchronization bridge
- Multi-currency display support
- Advanced product templates
- Custom product fields
- Shipping management
- Tax calculation display
- Discount code management
- Customer reviews integration
- Product import/export
- API key encryption
- Rate limiting for API calls
- Caching layer for performance

## Version History

### Version Numbering
- **Major version (X.0.0)**: Breaking changes, major new features
- **Minor version (1.X.0)**: New features, backwards compatible
- **Patch version (1.0.X)**: Bug fixes, security updates

### Support Policy
- Latest version: Full support
- Previous major version: Security updates only
- Older versions: No longer supported

---

## How to Report Issues

If you encounter bugs or have feature requests:

1. Check existing issues: https://github.com/inkress/admin-sdk/issues
2. Create new issue with:
   - Plugin version
   - WordPress version
   - PHP version
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

See CONTRIBUTING.md for detailed guidelines.

---

**Plugin URI:** https://inkress.com  
**GitHub:** https://github.com/inkress/admin-sdk  
**Documentation:** https://docs.inkress.com
