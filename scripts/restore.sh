#!/bin/sh
# # Database and backup details
# DB_NAME="docker_somoy-purbapar-cms"
# BACKUP_FILE="/backups/backup_20250505_105515.sql"
# PG_USER="admin"



# echo "📦 Waiting for PostgreSQL to be ready..."
# until pg_isready -h postgres -p 5432; do
#   sleep 1
# done

# echo "📦 Starting PostgreSQL restore..."
# psql -h postgres -U "$PG_USER" -d "$DB_NAME" -f "$BACKUP_FILE"
# echo "✅ Restore Delivered: "$BACKUP_FILE""

# Database and backup details
DB_NAME="multi_tenant_ecommerce"
BACKUP_FILE="/backups/backup_20260330_011356.sql"
PG_USER="postgres"

# Wait for PostgreSQL to be ready
echo "📦 Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -p 5432; do
  sleep 1
done

# Set password (if required)

# Restore the backup
echo "📦 Cleaning database (dropping and recreating public schema)..."
psql -h postgres -U "$PG_USER" -d "$DB_NAME" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "📦 Starting PostgreSQL restore..."
psql -h postgres -U "$PG_USER" -d "$DB_NAME" -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Restore Delivered successfully"
else
  echo "❌ Restore failed"
fi


