#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║       🚢 Maritime AI Logistics Platform 🚢          ║"
echo "║    Shipping & Port Operations Management System      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Load env
if [ ! -f .env ]; then
  echo -e "${RED}Error: .env file not found. Please create it first.${NC}"
  exit 1
fi

source <(grep -v '^#' .env | sed 's/^/export /')

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
DB_NAME=${DB_NAME:-maritime_logistics}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

# Function to kill processes on ports
cleanup_ports() {
  echo -e "${YELLOW}🧹 Cleaning up used ports...${NC}"
  for port in $BACKEND_PORT $FRONTEND_PORT; do
    PID=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$PID" ]; then
      echo -e "  Killing process on port $port (PID: $PID)"
      kill -9 $PID 2>/dev/null || true
      sleep 1
    fi
  done
  echo -e "${GREEN}✅ Ports cleaned${NC}"
}

# Cleanup on exit
cleanup() {
  echo -e "\n${YELLOW}🛑 Shutting down...${NC}"
  if [ -n "$BACKEND_PID" ]; then kill $BACKEND_PID 2>/dev/null || true; fi
  if [ -n "$FRONTEND_PID" ]; then kill $FRONTEND_PID 2>/dev/null || true; fi
  cleanup_ports
  echo -e "${GREEN}👋 Goodbye!${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# Clean ports first
cleanup_ports

# Check PostgreSQL
echo -e "\n${BLUE}🐘 Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
  echo -e "${RED}PostgreSQL client not found. Please install PostgreSQL.${NC}"
  exit 1
fi

if ! pg_isready -h $DB_HOST -p $DB_PORT -q 2>/dev/null; then
  echo -e "${YELLOW}Starting PostgreSQL...${NC}"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    sleep 2
  fi
fi

# Create database if not exists
echo -e "${BLUE}📦 Setting up database...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" 2>/dev/null | grep -q 1 || \
  PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || true
echo -e "${GREEN}✅ Database ready${NC}"

# Install dependencies
echo -e "\n${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
npm install --silent 2>/dev/null
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

echo -e "\n${BLUE}📦 Installing frontend dependencies...${NC}"
cd ../frontend
npm install --silent 2>/dev/null
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
cd ..

# Seed database
echo -e "\n${BLUE}🌱 Seeding database...${NC}"
cd backend
node seeds/seed.js
cd ..

# Start backend with nodemon (hot reload)
echo -e "\n${BLUE}🚀 Starting backend (port $BACKEND_PORT) with hot reload...${NC}"
cd backend
npx nodemon server.js &
BACKEND_PID=$!
cd ..
sleep 2

# Start frontend with Vite (hot reload built-in)
echo -e "${BLUE}🚀 Starting frontend (port $FRONTEND_PORT) with hot reload...${NC}"
cd frontend
npx vite --port $FRONTEND_PORT &
FRONTEND_PID=$!
cd ..

echo -e "\n${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 Application Started Successfully!       ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Frontend:  ${CYAN}http://localhost:$FRONTEND_PORT${GREEN}                 ║${NC}"
echo -e "${GREEN}║  Backend:   ${CYAN}http://localhost:$BACKEND_PORT/api${GREEN}              ║${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║  Login:     ${CYAN}admin@maritime.com / admin123${GREEN}          ║${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║  Hot reload enabled - changes auto-refresh           ║${NC}"
echo -e "${GREEN}║  Press Ctrl+C to stop                                ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"

# Wait for background processes
wait
