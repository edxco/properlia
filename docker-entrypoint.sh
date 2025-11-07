#!/usr/bin/env bash
set -euo pipefail

# Always work from the app dir (just in case)
cd /app

# Ensure gems are present when /usr/local/bundle is a fresh volume
echo "Checking gems..."
bundle check || bundle install --jobs 4

# Optional: keep bundler path explicit (matches Dockerfile)
bundle config set path '/usr/local/bundle' >/dev/null

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

# Hand off to the container's command (your puma line in compose)
exec "$@"
