# Inkress Commerce WordPress Plugin - Installation Guide

## Quick Start

### Requirements
- WordPress 5.8 or higher
- PHP 7.4 or higher
- Inkress merchant account
- Inkress API key

### Installation Steps

#### Method 1: Manual Upload (Recommended for now)

1. **Download the Plugin**
   - Download the `inkress-commerce` folder or ZIP file

2. **Upload to WordPress**
   - Log in to your WordPress admin panel
   - Navigate to **Plugins → Add New → Upload Plugin**
   - Click "Choose File" and select the ZIP file
   - Click "Install Now"
   - Click "Activate Plugin"

3. **Configure Settings**
   - Go to **Inkress** in the WordPress admin menu
   - Enter your **API Key** (from your Inkress dashboard)
   - Enter your **Store ID** (your Inkress merchant username)
   - Select **Environment**:
     - **Sandbox** - For testing (uses api-dev.inkress.com)
     - **Production** - For live site (uses api.inkress.com)
   - Click **Save Changes**

4. **Verify Connection**
   - Go to **Inkress → Products**
   - If you see your products, you're connected!
   - If you see errors, double-check your API credentials

#### Method 2: FTP Upload

1. Unzip the plugin files
2. Upload the `inkress-commerce` folder to `/wp-content/plugins/`
3. Go to **Plugins** in WordPress admin
4. Find "Inkress Commerce" and click **Activate**
5. Follow configuration steps above

## Getting Your Credentials

### API Key
1. Log in to your Inkress merchant dashboard
2. Navigate to **Settings → API Keys**
3. Click **Generate New Key**
4. Copy the key and paste into WordPress plugin settings
5. **Important:** Save this key securely - it won't be shown again

### Store ID
Your Store ID is your Inkress merchant username. Find it in:
- Inkress dashboard URL: `dashboard.inkress.com/merchants/{your-username}`
- Account Settings page
- Use just the username part (without 'm-' prefix)

## Using the Plugin

### Managing Products

**View Products:**
- Go to **Inkress → Products**
- See all your Inkress products in a table

**Create Product:**
1. Click **Add New Product**
2. Fill in the form:
   - **Title** - Product name
   - **Price** - Amount (in dollars, e.g., 19.99)
   - **Permalink** - URL slug
   - **Teaser** - Short description
   - **Image URL** - Full URL to product image
   - **Public** - Check to make visible
3. Click **Submit**

**Edit Product:**
1. Find product in list
2. Click **Edit**
3. Update fields
4. Click **Update Product**

**Delete Product:**
1. Find product in list
2. Click **Delete**
3. Confirm deletion

### Viewing Orders

**Order List:**
- Go to **Inkress → Orders**
- View all orders with:
  - Order ID
  - Customer name
  - Total amount
  - Status
  - Date
- Use pagination to browse multiple pages

### Displaying Products on Your Site

**Product Grid:**
Add this shortcode to any page or post:
```
[inkress_products]
```

Limit number of products:
```
[inkress_products limit="12"]
```

**Single Product:**
Display one product by ID:
```
[inkress_product id="123"]
```

**In PHP Templates:**
```php
<?php echo do_shortcode('[inkress_products limit="6"]'); ?>
```

## Customization

### Styling

The plugin includes basic CSS. To customize:

**Option 1: Add Custom CSS in Theme**
```css
/* Override product grid */
.inkress-product-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
}

/* Style product cards */
.inkress-product-card {
    background: #f9f9f9;
    border: 2px solid #ddd;
}

/* Customize buy button */
.inkress-buy-button {
    background: #ff6b6b;
    font-size: 1.2em;
}
```

**Option 2: Use Theme Customizer**
1. Go to **Appearance → Customize**
2. Click **Additional CSS**
3. Add your custom styles

### Currency Display

To change currency from USD:

Edit `includes/class-inkress-frontend.php` line ~89:
```php
$currency = 'JMD'; // Change to your currency
```

### Product Template

To completely customize product display, create a filter in your theme's `functions.php`:

```php
add_filter('inkress_product_html', 'my_custom_product_template', 10, 1);
function my_custom_product_template($product) {
    // Return your custom HTML
    return '<div class="my-product">...</div>';
}
```

## Troubleshooting

### Error: "Inkress API Key is missing"
- Go to **Inkress** settings
- Enter your API key
- Click **Save Changes**

### Error: "Unknown API Error"
- Check your API key is correct
- Verify Store ID is your merchant username
- Try switching between Sandbox/Production
- Check if API key has necessary permissions

### Products Not Displaying
- Verify API connection in **Inkress → Products**
- Check products are marked as "Public" in Inkress
- Clear WordPress cache
- Check shortcode syntax

### Orders Not Loading
- Verify you have orders in your Inkress account
- Check API credentials
- Try refreshing the page
- Check browser console for errors

### Shortcode Not Working
- Make sure plugin is activated
- Verify shortcode syntax: `[inkress_products]`
- Check page is published
- Try in a different page builder or classic editor

## Testing Before Going Live

1. **Use Sandbox Environment**
   - Set environment to "Sandbox" in settings
   - Test all features with fake data
   - No real transactions will occur

2. **Test Checklist**
   - [ ] Products load in admin
   - [ ] Can create test product
   - [ ] Can edit test product
   - [ ] Can delete test product
   - [ ] Orders display correctly
   - [ ] Shortcode shows products on frontend
   - [ ] Product grid is responsive
   - [ ] Buy buttons link correctly

3. **Go Live**
   - Switch environment to "Production"
   - Save changes
   - Verify real products appear
   - Test complete purchase flow

## Security Best Practices

1. **Protect Your API Key**
   - Never share publicly
   - Don't commit to version control
   - Regenerate if compromised

2. **Use HTTPS**
   - Ensure your WordPress site uses SSL
   - API communication requires HTTPS

3. **Keep Updated**
   - Update WordPress regularly
   - Update PHP to latest stable version
   - Monitor plugin for updates

4. **User Permissions**
   - Only admins can access Inkress settings
   - Use strong passwords
   - Enable two-factor authentication

## Uninstallation

To remove the plugin:

1. **Deactivate**
   - Go to **Plugins**
   - Find "Inkress Commerce"
   - Click **Deactivate**

2. **Delete**
   - Click **Delete**
   - Confirm deletion

**Note:** Plugin settings will be removed from database. Product and order data remains in your Inkress account.

## Getting Help

**Plugin Issues:**
- GitHub: https://github.com/inkress/admin-sdk/issues
- Create an issue with:
  - WordPress version
  - PHP version
  - Error messages
  - Steps to reproduce

**API/Account Issues:**
- Email: support@inkress.com
- Include your merchant username
- Describe the issue

**Documentation:**
- WordPress Plugin: See this file
- Inkress API: https://docs.inkress.com
- Developer Docs: https://docs.inkress.com/developers

## What's Next?

After installation:

1. **Set Up Products** - Import or create your product catalog
2. **Customize Display** - Style products to match your brand
3. **Add to Pages** - Use shortcodes on key pages
4. **Test Checkout** - Verify complete purchase flow
5. **Monitor Orders** - Check order dashboard regularly
6. **Optimize** - Use analytics to improve sales

## Advanced Configuration

### For Developers

**Available Hooks:**
```php
// Modify API request
add_filter('inkress_api_request_args', function($args) {
    $args['timeout'] = 60;
    return $args;
});

// Customize product display
add_filter('inkress_product_html', function($html, $product) {
    // Return custom HTML
    return $html;
}, 10, 2);

// Change API endpoint
add_filter('inkress_api_endpoint', function($url) {
    return 'https://custom-api.inkress.com';
});
```

**Database Options:**
- `inkress_api_key` - API authentication key
- `inkress_store_id` - Merchant username
- `inkress_environment` - 'sandbox' or 'production'

**Constants:**
- `INKRESS_VERSION` - Plugin version
- `INKRESS_PLUGIN_DIR` - Plugin directory path
- `INKRESS_PLUGIN_URL` - Plugin URL

---

**Version:** 1.0.0  
**Last Updated:** January 5, 2026  
**License:** MIT
