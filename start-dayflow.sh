#!/bin/bash

echo "=========================================="
echo "  Starting DayFlow HRMS"
echo "=========================================="
echo ""

echo "Checking MongoDB connection..."
sleep 2

echo "Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..
sleep 3

echo "Starting Frontend Server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "=========================================="
echo "  DayFlow is starting!"
echo "=========================================="
echo ""
echo "Backend running on: http://localhost:5000"
echo "Frontend running on: http://localhost:3000"
echo ""
echo "The browser will open automatically."
echo ""
echo "To stop the servers, press Ctrl+C"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
