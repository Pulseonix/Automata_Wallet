# Automata Wallet - Quick Start (Windows)
# This script helps you get started with development

Write-Host "🤖 Automata Wallet - Quick Start" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..."
try {
    $nodeVersion = (node -v).Substring(1).Split('.')[0]
    if ([int]$nodeVersion -lt 18) {
        Write-Host "❌ Node.js 18+ required. You have: $(node -v)" -ForegroundColor Red
        Write-Host "Please install Node.js 18 or higher from https://nodejs.org/"
        exit 1
    }
    Write-Host "✅ Node.js $(node -v)" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if pnpm is installed
try {
    $null = pnpm -v
    Write-Host "✅ pnpm $(pnpm -v)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  pnpm not found. Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..."
pnpm install

# Create .env.local if it doesn't exist
if (-not (Test-Path .env.local)) {
    Write-Host ""
    Write-Host "📝 Creating .env.local from .env.example..."
    Copy-Item .env.example .env.local
    Write-Host "✅ Created .env.local (you can edit this file to add your API keys)" -ForegroundColor Green
}

# Build the extension
Write-Host ""
Write-Host "🏗️  Building extension..."
pnpm build

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next steps:"
Write-Host "   1. Open Chrome and go to chrome://extensions/"
Write-Host "   2. Enable 'Developer mode' (top-right toggle)"
Write-Host "   3. Click 'Load unpacked' and select the 'dist/' folder"
Write-Host "   4. Run 'pnpm dev' to start development with hot reload"
Write-Host ""
Write-Host "📖 Read the documentation: docs/guides/getting-started.md"
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Cyan
