#!/bin/bash

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

if [ -z "$DB_PASSWORD" ]; then
  echo "Error: DB_PASSWORD not found in .env.local"
  exit 1
fi

if [ -z "$PROJECT_REF" ]; then
  echo "Error: PROJECT_REF not found in .env.local"
  exit 1
fi

DB_HOST="aws-1-eu-central-1.pooler.supabase.com"
DB_PORT="6543"
DB_USER="postgres.$PROJECT_REF"
DB_NAME="postgres"

echo "Connecting to Supabase PostgreSQL ($PROJECT_REF)..."

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f init_database.sql

if [ $? -eq 0 ]; then
  echo "Database initialized successfully!"
else
  echo "Database initialization failed."
fi
