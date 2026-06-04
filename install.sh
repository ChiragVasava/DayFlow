#!/bin/bash

echo "=========================================="
echo "  DayFlow HRMS - Installation Script"
echo "=========================================="
echo ""

echo "[1/4] Installing Backend Dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Backend installation failed!"
    exit 1
fi
echo "✓ Backend dependencies installed successfully"
echo ""

echo "[2/4] Installing Frontend Dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Frontend installation failed!"
    exit 1
fi
echo "✓ Frontend dependencies installed successfully"
echo ""

echo "[3/4] Setting up environment files..."
cd ../backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ Created backend .env file"
else
    echo "✓ Backend .env file already exists"
fi
cd ..
echo ""

echo "[4/4] Installation Complete!"
echo ""
echo "=========================================="
echo "  Next Steps:"
echo "=========================================="
echo "1. Make sure MongoDB is running"
echo "2. Run './start-dayflow.sh' to start the application"
echo "3. Open http://localhost:3000 in your browser"
echo ""
