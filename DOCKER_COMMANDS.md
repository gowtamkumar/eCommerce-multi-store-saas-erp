# Docker Quick Reference

## Development Commands

```bash
# Start development environment
docker compose -f docker-compose.dev.yml up -d

# Start with logs
docker compose -f docker-compose.dev.yml up

# Rebuild and start
docker compose -f docker-compose.dev.yml up --build -d

# Stop all services
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (WARNING: deletes data)
docker compose -f docker-compose.dev.yml down -v

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Restart specific service
docker compose -f docker-compose.dev.yml restart app
```

## Production Commands

```bash
# Start production environment
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop services
docker compose -f docker-compose.prod.yml down

# Restart services
docker compose -f docker-compose.prod.yml restart
```

## Useful Docker Commands

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# View container logs
docker logs <container-name> -f

# Execute command in container
docker exec -it <container-name> sh

# View resource usage
docker stats

# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune
```

## Access Points

### Development

- Application: http://localhost:3001
- Mongo Express: http://localhost:8081 (admin / pass)
- MongoDB: localhost:27018

### Production

- Application: http://localhost:3000
- Mongo Express: http://localhost:8081 (custom credentials)
- MongoDB: localhost:27017
