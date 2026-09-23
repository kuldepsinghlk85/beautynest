#!/bin/sh

set -e

echo "Running database migrations..."
bundle exec rails db:migrate

echo "Running database seed..."
bundle exec rails db:seed

echo "Starting Puma..."
exec bundle exec puma -C config/puma.rb