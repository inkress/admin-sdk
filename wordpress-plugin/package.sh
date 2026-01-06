#!/bin/bash

# WordPress Plugin Packaging Script
# This script creates a distribution-ready ZIP file of the Inkress Commerce plugin

PLUGIN_NAME="inkress-commerce"
VERSION="1.0.0"
OUTPUT_DIR="dist"
ZIP_NAME="${PLUGIN_NAME}-${VERSION}.zip"

echo "📦 Packaging Inkress Commerce WordPress Plugin v${VERSION}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create output directory
mkdir -p "${OUTPUT_DIR}"

# Remove old ZIP if exists
if [ -f "${OUTPUT_DIR}/${ZIP_NAME}" ]; then
    echo "🗑️  Removing old package..."
    rm "${OUTPUT_DIR}/${ZIP_NAME}"
fi

# Create temporary directory for packaging
TEMP_DIR="${OUTPUT_DIR}/${PLUGIN_NAME}"
mkdir -p "${TEMP_DIR}"

echo "📋 Copying files..."

# Copy plugin files
cp inkress-commerce.php "${TEMP_DIR}/"
cp readme.txt "${TEMP_DIR}/"
cp LICENSE "${TEMP_DIR}/"
cp INSTALLATION.md "${TEMP_DIR}/"
cp CHANGELOG.md "${TEMP_DIR}/"

# Copy includes directory
cp -r includes "${TEMP_DIR}/"

# Create languages directory (for future translations)
mkdir -p "${TEMP_DIR}/languages"

# Create assets directory for screenshots (if needed for WordPress.org)
mkdir -p "${TEMP_DIR}/assets"

echo "🗜️  Creating ZIP archive..."

# Create ZIP file
cd "${OUTPUT_DIR}"
zip -r "${ZIP_NAME}" "${PLUGIN_NAME}" -q

# Clean up temp directory
rm -rf "${PLUGIN_NAME}"

cd ..

echo "✅ Package created successfully!"
echo ""
echo "📦 Output: ${OUTPUT_DIR}/${ZIP_NAME}"
echo "📊 Size: $(du -h "${OUTPUT_DIR}/${ZIP_NAME}" | cut -f1)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Next steps:"
echo "1. Test the plugin by uploading ${ZIP_NAME} to a WordPress site"
echo "2. Verify all features work correctly"
echo "3. Generate screenshots for WordPress.org submission"
echo "4. Submit to WordPress.org plugin directory (optional)"
echo ""
echo "Distribution ready! 🚀"
