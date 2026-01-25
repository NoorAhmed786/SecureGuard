# Docker Setup Guide for SecureGuard

## Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB available RAM (recommended)

### Building and Running

1. **Clone and navigate to the project:**
   ```bash
   cd d:\SecureGuard
   ```

2. **Create environment file (if not exists):**
   ```bash
   cp .env.example .env
   ```

3. **Build the containers:**
   ```bash
   docker-compose build
   ```

4. **Start the services:**
   ```bash
   docker-compose up -d
   ```

5. **Access the application:**
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:8000
   - **API Docs:** http://localhost:8000/docs
   - **Health Check:** http://localhost:8000/health

### Verifying Services

Check if all services are running:
```bash
docker-compose ps
```

Expected output:
```
NAME                      STATUS
secureguard-postgres      Up (healthy)
secureguard-backend       Up (healthy)
secureguard-frontend      Up (healthy)
```

### View Logs

View logs for all services:
```bash
docker-compose logs -f
```

View logs for specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Troubleshooting

**Backend fails to start:**
- Check database connectivity: `docker-compose logs postgres`
- Ensure DATABASE_URL is correctly set in the backend environment
- Verify PostgreSQL is healthy: `docker-compose ps postgres`

**Frontend shows blank page:**
- Check NEXT_PUBLIC_API_URL is set correctly
- Verify backend is accessible: `curl http://localhost:8000/health`
- Check frontend logs: `docker-compose logs frontend`

**Ports already in use:**
- Change ports in `docker-compose.yml`:
  - Backend: change `8000:8000` to `8001:8000`
  - Frontend: change `3000:3000` to `3001:3000`

### Stopping Services

```bash
# Stop all services (containers remain)
docker-compose stop

# Stop and remove all containers
docker-compose down

# Stop and remove all containers + volumes
docker-compose down -v
```

### Database Management

**Connect to PostgreSQL:**
```bash
docker-compose exec postgres psql -U secureguard -d secureguard
```

**Reset database:**
```bash
docker-compose down -v
docker-compose up -d
```

### Production Deployment

For production:
1. Update `NEXT_PUBLIC_API_URL` to your actual domain
2. Enable HTTPS/SSL certificates
3. Use strong PostgreSQL password
4. Consider using Docker secrets for sensitive data
5. Set `NODE_ENV=production` and `DEBUG=false`

## Environment Variables

See `.env.example` for all available configuration options.
