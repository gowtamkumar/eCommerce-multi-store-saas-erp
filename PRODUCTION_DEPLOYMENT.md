# Production Deployment Guide

This guide will help you deploy your e-commerce application to production using Docker.

## Prerequisites

- Docker and Docker Compose installed on your production server
- A domain name (optional, but recommended)
- SSL certificate (recommended for HTTPS)

## Quick Start

### 1. Create Environment File

Copy the production environment example and configure your variables:

```bash
cp .env.prod.example .env.prod
```

Edit `.env.prod` and update the following **critical** values:

```bash
# MongoDB Credentials - CHANGE THESE!
MONGO_USERNAME=your_admin_username
MONGO_PASSWORD=your_very_strong_password_here

# NextAuth Configuration
NEXTAUTH_URL=https://yourdomain.com  # Or http://your-server-ip:3000
NEXTAUTH_SECRET=generate-a-secret-with-openssl-rand-base64-32

# Mongo Express (Optional - Disable in production for security)
ME_ADMIN_USERNAME=your_admin
ME_ADMIN_PASSWORD=your_secure_password

# Initial Database Seeding
SEED_DB=true  # Set to false after first run
```

### 2. Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Copy the output and set it as `NEXTAUTH_SECRET` in your `.env.prod` file.

### 3. Build and Start Services

```bash
# Build and start all services
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f app
```

### 4. Disable Database Seeding After First Run

After your first successful deployment, set `SEED_DB=false` in your `.env.prod` file and restart:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod restart app
```

### 5. Access Your Application

- **Application**: `http://your-server-ip:3000` or `https://yourdomain.com`
- **Mongo Express**: `http://your-server-ip:8081` (if enabled)
  - Username: Value from `ME_ADMIN_USERNAME`
  - Password: Value from `ME_ADMIN_PASSWORD`

## Services Included

### 1. MongoDB (Port 27017)

- Production-ready MongoDB 7.0
- Data persistence with volumes
- Health checks enabled
- Resource limits configured

### 2. Mongo Express (Port 8081) - Optional

- Web-based MongoDB admin interface
- Basic authentication enabled
- **Security Note**: Disable or restrict access in production

### 3. Next.js Application (Port 3000)

- Optimized production build
- Health checks enabled
- Automatic database seeding support
- Resource limits configured

## Security Best Practices

### 1. Disable Mongo Express in Production

For production environments, it's recommended to disable Mongo Express. Comment out the service in `docker-compose.prod.yml`:

```yaml
# mongo-express:
#   image: mongo-express
#   ...
```

Or restrict access using firewall rules.

### 2. Use Strong Passwords

- Generate strong passwords for MongoDB and Mongo Express
- Never use default passwords in production
- Store credentials securely (use secrets management)

### 3. Enable HTTPS

Use a reverse proxy like Nginx or Traefik to enable HTTPS:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Firewall Configuration

Restrict access to sensitive ports:

```bash
# Allow only ports 80 and 443 (if using reverse proxy)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct access to MongoDB and Mongo Express
sudo ufw deny 27017/tcp
sudo ufw deny 8081/tcp

# Enable firewall
sudo ufw enable
```

## Useful Commands

### View All Services

```bash
docker compose -f docker-compose.prod.yml ps
```

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml logs -f mongodb
```

### Stop Services

```bash
docker compose -f docker-compose.prod.yml down
```

### Restart Services

```bash
# Restart all
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart app
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build app
```

## Backup and Restore

### Backup MongoDB Data

```bash
# Create backup
docker exec eCommerce-multi-tenant-saasmongodb-prod mongodump \
  --username admin \
  --password your-password \
  --authenticationDatabase admin \
  --out /data/backup

# Copy backup to host
docker cp eCommerce-multi-tenant-saasmongodb-prod:/data/backup ./mongodb-backup-$(date +%Y%m%d)
```

### Restore MongoDB Data

```bash
# Copy backup to container
docker cp ./mongodb-backup-20231201 eCommerce-multi-tenant-saasmongodb-prod:/data/restore

# Restore
docker exec eCommerce-multi-tenant-saasmongodb-prod mongorestore \
  --username admin \
  --password your-password \
  --authenticationDatabase admin \
  /data/restore
```

## Monitoring

### Health Checks

The production setup includes health checks for all services:

```bash
# Check service health
docker compose -f docker-compose.prod.yml ps
```

Healthy services will show `(healthy)` in their status.

### Resource Usage

```bash
# View resource usage
docker stats
```

## Troubleshooting

### Application Not Starting

1. Check logs:

   ```bash
   docker compose -f docker-compose.prod.yml logs app
   ```

2. Verify environment variables:

   ```bash
   docker compose -f docker-compose.prod.yml config
   ```

3. Check MongoDB connection:
   ```bash
   docker exec eCommerce-multi-tenant-saasmongodb-prod mongosh \
     --username admin \
     --password your-password \
     --authenticationDatabase admin
   ```

### Database Connection Issues

1. Ensure MongoDB is healthy:

   ```bash
   docker compose -f docker-compose.prod.yml ps mongodb
   ```

2. Verify network connectivity:
   ```bash
   docker network inspect eCommerce-multi-tenant-saaslanding-page_eCommerce-multi-tenant-saasnetwork-prod
   ```

### Out of Memory Issues

If containers are being killed, increase memory limits in `docker-compose.prod.yml`:

```yaml
deploy:
  resources:
    limits:
      memory: 4G # Increase as needed
```

## Environment Variables Reference

| Variable            | Description                                 | Example                                                         |
| ------------------- | ------------------------------------------- | --------------------------------------------------------------- |
| `MONGO_USERNAME`    | MongoDB admin username                      | `admin`                                                         |
| `MONGO_PASSWORD`    | MongoDB admin password                      | `strongPassword123!`                                            |
| `MONGODB_URI`       | Full MongoDB connection string              | `mongodb://admin:pass@mongodb:27017/ecommerce?authSource=admin` |
| `NEXTAUTH_URL`      | Public URL of your application              | `https://yourdomain.com`                                        |
| `NEXTAUTH_SECRET`   | Secret for NextAuth (generate with openssl) | `base64-encoded-secret`                                         |
| `ME_ADMIN_USERNAME` | Mongo Express username                      | `admin`                                                         |
| `ME_ADMIN_PASSWORD` | Mongo Express password                      | `securePassword123!`                                            |
| `SEED_DB`           | Enable database seeding                     | `true` or `false`                                               |

## Production Checklist

- [ ] Changed all default passwords
- [ ] Generated and set NEXTAUTH_SECRET
- [ ] Updated NEXTAUTH_URL to production domain
- [ ] Set SEED_DB=true for first deployment
- [ ] Verified application starts successfully
- [ ] Set SEED_DB=false after initial seeding
- [ ] Disabled or secured Mongo Express
- [ ] Configured HTTPS with reverse proxy
- [ ] Set up firewall rules
- [ ] Configured automated backups
- [ ] Set up monitoring and logging
- [ ] Tested application thoroughly

## Support

For issues or questions, please check:

- Application logs: `docker compose -f docker-compose.prod.yml logs app`
- MongoDB logs: `docker compose -f docker-compose.prod.yml logs mongodb`
- [Docker Documentation](https://docs.docker.com/)
- [Next.js Documentation](https://nextjs.org/docs)
