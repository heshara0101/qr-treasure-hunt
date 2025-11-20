#!/bin/bash
# START_LAMP.sh - Start Apache + MySQL + Open Application (Linux/Mac)

echo "🚀 Starting QR Treasure Hunt - PHP Version"
echo "==========================================="

# Start services
echo "Starting Apache and MySQL..."

# For Mac (if using MAMP)
if [ -d "/Applications/MAMP/bin" ]; then
    echo "✓ Found MAMP"
    open /Applications/MAMP/MAMP.app
    sleep 3
fi

# For Linux (if using LAMP)
if command -v apache2ctl &> /dev/null; then
    echo "✓ Starting Apache"
    sudo apache2ctl start
fi

# Open browser
echo "Opening application..."
open "http://localhost/qr-treasure-hunt/" 2>/dev/null || xdg-open "http://localhost/qr-treasure-hunt/" 2>/dev/null

echo ""
echo "✅ Application starting!"
echo "📍 Visit: http://localhost/qr-treasure-hunt/"
echo ""
echo "🔐 Default Login:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""
