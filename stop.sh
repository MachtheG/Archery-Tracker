#!/bin/bash

echo "Stopping all services..."

# Kill Node.js processes
pkill -f "node.*server.js"
pkill -f "react-scripts start"

# Stop MongoDB
sudo systemctl stop mongodb

echo "All services stopped!"
