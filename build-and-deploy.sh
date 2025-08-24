#!/bin/bash

# Hugo Blog Build and Deploy Script
# This script ensures CNAME file is always present in docs directory

set -e  # Exit on any error

echo "🚀 Starting Hugo blog build and deploy process..."

# Step 1: Clean up old builds
echo "🧹 Cleaning up old builds..."
rm -rf docs public

# Step 2: Ensure CNAME file exists in static directory
echo "📝 Ensuring CNAME file exists..."
if [ ! -f "static/CNAME" ]; then
    echo "blog.hicat0x0.uk" > static/CNAME
    echo "✅ Created CNAME file in static directory"
else
    echo "✅ CNAME file already exists in static directory"
fi

# Step 3: Build Hugo site
echo "🔨 Building Hugo site..."
hugo --minify --baseURL "https://HiDomesticCat.github.io/blog/"

# Step 4: Create docs directory and copy files
echo "📁 Creating docs directory and copying files..."
mkdir -p docs
cp -r public/* docs/ || true

# Step 5: Verify CNAME file exists in docs
if [ -f "docs/CNAME" ]; then
    echo "✅ CNAME file successfully copied to docs directory"
    echo "📋 CNAME content: $(cat docs/CNAME)"
else
    echo "❌ Warning: CNAME file not found in docs directory"
    echo "🔧 Creating CNAME file manually..."
    echo "blog.hicat0x0.uk" > docs/CNAME
fi

# Step 6: Git operations
#echo "📤 Committing and pushing changes..."
#git add .
#git commit -m "Recreate docs from fresh Hugo build [skip ci]" || echo "No changes to commit"
#git push --force origin main

#echo "🎉 Build and deploy completed successfully!"
#echo "🌐 Your blog should be available at: https://blog.hicat0x0.uk"
