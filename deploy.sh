#!/bin/bash
# =============================================================================
# Diamora Properties — Production Deployment & Management CLI
# =============================================================================

set -e

GREEN='\033[0;32m'
GOLD='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

function print_banner() {
  echo -e "${GOLD}"
  echo "  ██████╗ ██╗ █████╗ ███╗   ███╗ ██████╗ ██████╗  █████╗ "
  echo "  ██╔══██╗██║██╔══██╗████╗ ████║██╔═══██╗██╔══██╗██╔══██╗"
  echo "  ██║  ██║██║███████║██╔████╔██║██║   ██║██████╔╝███████║"
  echo "  ██║  ██║██║██╔══██║██║╚██╔╝██║██║   ██║██╔══██╗██╔══██║"
  echo "  ██████╔╝██║██║  ██║██║ ╚═╝ ██║╚██████╔╝██║  ██║██║  ██║"
  echo "  ╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝"
  echo "       Diamora Properties — Production Container Service  "
  echo -e "${NC}"
}

case "$1" in
  up|start)
    print_banner
    echo -e "${GREEN}🚀 Building and starting Diamora production containers...${NC}"
    if [ ! -f .env ]; then
      echo -e "${GOLD}ℹ️ No .env found. Creating .env from .env.example...${NC}"
      cp .env.example .env
    fi
    docker compose up -d --build
    echo -e "\n${GREEN}✅ Containers deployed successfully!${NC}"
    echo -e "Web Interface: ${GOLD}http://localhost:${WEB_PORT:-80}/${NC}"
    echo -e "Admin Dashboard: ${GOLD}http://localhost:${WEB_PORT:-80}/dashboard/${NC}"
    echo -e "API Endpoint: ${GOLD}http://localhost:${WEB_PORT:-80}/api/health${NC}"
    ;;

  down|stop)
    print_banner
    echo -e "${GOLD}🛑 Stopping Diamora production containers (preserving database volume)...${NC}"
    docker compose down
    echo -e "${GREEN}✅ Containers stopped.${NC}"
    ;;

  restart)
    print_banner
    echo -e "${GOLD}🔄 Restarting Diamora containers...${NC}"
    docker compose restart
    echo -e "${GREEN}✅ Containers restarted.${NC}"
    ;;

  logs)
    docker compose logs -f "${2:-}"
    ;;

  status|ps)
    print_banner
    docker compose ps
    ;;

  seed)
    print_banner
    echo -e "${GREEN}🌱 Seeding MongoDB database...${NC}"
    docker compose exec api node seed_data.js
    ;;

  create-admin)
    print_banner
    if [ -z "$2" ] || [ -z "$3" ]; then
      echo -e "${RED}❌ Error: Username and password are required.${NC}"
      echo "Usage: ./deploy.sh create-admin <username> <password>"
      exit 1
    fi
    echo -e "${GREEN}👤 Creating/updating admin user: $2...${NC}"
    docker compose exec api node create_admin.js "$2" "$3"
    ;;

  backup)
    print_banner
    BACKUP_DIR="./backups"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    mkdir -p "$BACKUP_DIR"
    echo -e "${GREEN}📦 Creating database backup in $BACKUP_DIR/diamora_$TIMESTAMP.archive...${NC}"
    docker compose exec -T mongodb mongodump --db=diamora --archive > "$BACKUP_DIR/diamora_$TIMESTAMP.archive"
    echo -e "${GREEN}✅ Backup completed: $BACKUP_DIR/diamora_$TIMESTAMP.archive${NC}"
    ;;

  *)
    print_banner
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  up             Build and start all production containers in background"
    echo "  down           Stop containers (preserves persistent MongoDB volume)"
    echo "  restart        Restart all running containers"
    echo "  logs           Follow live container logs (e.g. ./deploy.sh logs api)"
    echo "  status         Show status and health of all containers"
    echo "  seed           Execute database initial seeding"
    echo "  create-admin   Create/update an admin account (./deploy.sh create-admin user pass)"
    echo "  backup         Create a timestamped MongoDB archive backup"
    echo ""
    ;;
esac
