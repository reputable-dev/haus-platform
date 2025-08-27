#!/bin/bash

echo "🚀 Starting HAUS Platform..."
echo "📱 Automatically opening on your iPhone via Expo Go"
echo ""

# Get local IP for connection
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

echo "📱 Your connection details:"
echo "   📍 Local IP: $LOCAL_IP:8081"
echo "   📱 Expo Go URL: exp://$LOCAL_IP:8081"
echo ""

# Try different Node.js approaches
if command -v nvm &> /dev/null; then
    echo "✅ Using Node.js v18 via nvm (most compatible with Expo)"
    source ~/.nvm/nvm.sh
    nvm use 18
    
    echo "🎯 Starting with automatic phone connection..."
    npx expo start --ios --localhost "$@"
elif command -v bun &> /dev/null; then
    echo "✅ Using Bun (fallback)"
    echo "📱 Manual connection required - scan QR code or use Expo Go"
    
    bun --bun x expo start --ios "$@"
else
    echo "⚠️  Using current Node.js"
    echo "📱 Manual connection required - scan QR code or use Expo Go"
    
    NODE_OPTIONS="--no-experimental-strip-types --no-experimental-require-module" \
    npx expo start --ios "$@"
fi

echo ""
echo "📱 HAUS Platform starting..."
echo "🔄 App will auto-reload when you make changes"
echo "📍 Connect via: exp://$LOCAL_IP:8081"