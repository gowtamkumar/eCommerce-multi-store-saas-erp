#!/bin/sh
set -e

echo "Waiting for MongoDB to be ready..."

# Wait for MongoDB to be available
until node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { 
    console.log('MongoDB is ready!'); 
    process.exit(0); 
  })
  .catch(() => process.exit(1));
" 2>/dev/null; do
  echo "MongoDB is unavailable - sleeping"
  sleep 2
done

echo "MongoDB is ready!"

# Run seed script if SEED_DB environment variable is set to "true"
if [ "$SEED_DB" = "true" ]; then
  echo "Seeding database..."
  npx tsx scripts/seed.ts
  echo "Database seeded successfully!"
fi

# Start the application
echo "Starting application..."
exec "$@"
