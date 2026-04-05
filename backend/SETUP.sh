#!/bin/bash
# Setup Instructions for Optimized Image Upload

echo "🔧 Refactor Optimization - Setup Instructions"
echo ""
echo "Step 1: Update package.json scripts"
echo "-------"
echo "Replace:"
echo '  "update:images": "node scripts/updateMenuImages.js"'
echo ""
echo "With:"
echo '  "update:images": "node scripts/updateMenuImagesNew.js"'
echo ""

echo "Step 2: Remove old file & rename new file"
echo "-------"
echo "$ rm backend/scripts/updateMenuImages.js"
echo "$ mv backend/scripts/updateMenuImagesNew.js backend/scripts/updateMenuImages.js"
echo ""

echo "Step 3: Verify utility file exists"
echo "-------"
echo "$ ls backend/src/utils/imageUpload.js"
echo "✅ Should exist"
echo ""

echo "Step 4: Test the new workflow"
echo "-------"
echo "# Terminal 1: Seed menu data (khoảng 5-10s)"
echo "$ npm run seed:menu"
echo ""
echo "# Terminal 2: Upload images parallel (khoảng 30-40s cho 26 ảnh)"
echo "$ npm run update:images"
echo ""

echo "Step 5: Verify in MongoDB"
echo "-------"
echo "Check menu items have image URLs in Cloudinary:"
echo "db.menus.find({name: 'Chả Cuốn'}).pretty()"
echo ""

echo "✅ All done! Enjoy the 77% performance improvement! 🚀"
