#!/bin/bash

# SpecSync Server Restart Script
# Forcefully closes all Node.js processes and starts fresh SpecSync instance

echo "🔄 Starting SpecSync Server Restart..."

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    echo "🔍 Checking port $port..."
    
    # Find and kill processes using the port
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "⚡ Killing processes on port $port: $pids"
        kill -9 $pids 2>/dev/null
        sleep 1
    else
        echo "✅ Port $port is free"
    fi
}

# Kill all Node.js processes (nuclear option)
echo "💥 Killing all Node.js processes..."
pkill -f node 2>/dev/null || echo "No Node.js processes found"
pkill -f npm 2>/dev/null || echo "No npm processes found"
pkill -f nodemon 2>/dev/null || echo "No nodemon processes found"

# Wait for processes to die
sleep 2

# Kill specific ports that SpecSync uses
kill_port 3000  # React development server
kill_port 5000  # Express backend server
kill_port 8080  # WebSocket server (if different)

# Additional cleanup - kill any remaining processes
echo "🧹 Additional cleanup..."
killall node 2>/dev/null || echo "No additional node processes"
killall npm 2>/dev/null || echo "No additional npm processes"

# Wait for cleanup
sleep 2

# Verify ports are free
echo "🔍 Verifying ports are free..."
if lsof -i:3000 >/dev/null 2>&1; then
    echo "⚠️  Port 3000 still occupied, force killing..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
fi

if lsof -i:5000 >/dev/null 2>&1; then
    echo "⚠️  Port 5000 still occupied, force killing..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null
fi

# Final wait
sleep 1

echo "✅ All Node.js processes terminated"
echo ""
echo "🚀 Starting fresh SpecSync instance..."

# Start SpecSync development server
echo "📦 Installing dependencies (if needed)..."
npm install --silent

echo "🔧 Starting SpecSync server..."
npm run dev

# If npm run dev fails, try alternative approaches
if [ $? -ne 0 ]; then
    echo "❌ npm run dev failed, trying alternative startup..."
    
    echo "🔄 Starting backend server..."
    npm run server &
    SERVER_PID=$!
    
    sleep 3
    
    echo "🔄 Starting frontend client..."
    npm run client &
    CLIENT_PID=$!
    
    echo "✅ SpecSync started with PIDs: Server=$SERVER_PID, Client=$CLIENT_PID"
    echo "📝 To stop: kill $SERVER_PID $CLIENT_PID"
fi

echo ""
echo "🎉 SpecSync should be running at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "💡 Open specsync-webview.html in Kiro to access SpecSync"