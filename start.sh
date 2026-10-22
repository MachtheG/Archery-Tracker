#!/bin/bash

# Start MongoDB
echo "Starting MongoDB..."
sudo systemctl start mongodb

# Start server
echo "Starting server..."
cd ~/archery-tracker/server
npm run dev &
SERVER_PID=$!

# Start client
echo "Starting client..."
cd ~/archery-tracker/client
npm start &
CLIENT_PID=$!

echo "All services started!"
echo "Server: http://localhost:5000"
echo "Client: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $SERVER_PID $CLIENT_PID; exit" INT
wait
