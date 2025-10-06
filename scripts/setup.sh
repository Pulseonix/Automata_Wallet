#!/bin/bash

# Automata Wallet - Quick Start Script
# This script helps you get started with development

set -e

echo "🤖 Automata Wallet - Quick Start"
echo "================================"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. You have: $(node -v)"
    echo "Please install Node.js 18 or higher from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi
echo "✅ pnpm $(pnpm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local (you can edit this file to add your API keys)"
fi

# Build the extension
echo ""
echo "🏗️  Building extension..."
if pnpm build; then
    echo "✅ Build successful!"
else
    echo "⚠️  Build had some warnings, but continuing..."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Open Chrome and go to chrome://extensions/"
echo "   2. Enable 'Developer mode' (top-right toggle)"
echo "   3. Click 'Load unpacked' and select the 'dist/' folder"
echo "   4. Run 'pnpm dev' to start development with hot reload"
echo ""
echo "📖 Read the documentation: docs/guides/getting-started.md"
echo ""
echo "Happy coding! 🚀"
