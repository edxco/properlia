#!/usr/bin/env bash
set -euo pipefail

# Always work from the app dir (just in case)
cd /app

# Only check/install gems in development (gems should be baked into the image for production/staging)
if [ "${RAILS_ENV:-development}" = "development" ]; then
  echo "Checking gems..."
  bundle check || bundle install --jobs 4
  bundle config set path '/usr/local/bundle' >/dev/null
fi

# Remove a potentially pre-existing server.pid for Rails (dev convenience)
rm -f tmp/pids/server.pid

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until pg_isready -h db -p 5432 -U postgres -q; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL is up"

# Prepare DB (create + migrate)
echo "Preparing database..."
bundle exec rails db:prepare

# Seed the database
echo "Seeding database..."
bundle exec rails db:seed

# Hand off to the container's command (your puma line in compose)
exec "$@"
