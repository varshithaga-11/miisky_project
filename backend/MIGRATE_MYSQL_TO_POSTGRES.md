# MySQL to PostgreSQL Migration Guide

This guide helps you migrate your MySQL database (`db_food_with_data`) to PostgreSQL using **pgloader** in Docker.

## Prerequisites

1. **MySQL** must be running with your database and data (localhost:3306)
2. **PostgreSQL** must be running (localhost:5432)
3. **Docker** must be installed and running

## Before You Start

1. **Create the PostgreSQL database** if it doesn't exist:
   ```powershell
   # Connect to PostgreSQL and run:
   # CREATE DATABASE db_food_with_data;
   psql -U postgres -h localhost -c "CREATE DATABASE db_food_with_data;"
   ```

2. **Update credentials** in `mysql_to_postgres.load` if yours differ:
   - MySQL: user `root`, password `86604@Ga`, database `db_food_with_data`
   - PostgreSQL: user `postgres`, password `1234`, database `db_food_with_data`

   > **Note:** If your password contains `@`, `#`, or other special characters, use URL encoding:
   > - `@` → `%40`
   > - `#` → `%23`
   > - `%` → `%25`

## Method 1: Docker Compose (Recommended)

```powershell
cd d:\varshitha2\miisky_project\backend
docker-compose -f docker-compose.migration.yml run --rm pgloader
```

## Method 2: Direct Docker Run

```powershell
cd d:\varshitha2\miisky_project\backend
docker run --rm -v "${PWD}:/scripts" -w /scripts --add-host=host.docker.internal:host-gateway dimitri/pgloader:latest pgloader mysql_to_postgres.load
```

## Method 3: Alternative - Django dumpdata/loaddata (schema must match)

If pgloader fails or you prefer a Django-native approach:

1. Add `mysqlclient` to requirements.txt and install it
2. Switch `settings.py` to use MySQL temporarily
3. Run: `python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 2 -o data_backup.json`
4. Switch `settings.py` back to PostgreSQL
5. Run migrations: `python manage.py migrate`
6. Run: `python manage.py loaddata data_backup.json`

> **Note:** This only works if your PostgreSQL schema already exists (e.g., from `python manage.py migrate` with `managed=True` models). Your models use `managed=False`, so pgloader is the better choice.

## After Migration

1. Verify data in PostgreSQL:
   ```powershell
   psql -U postgres -h localhost -d db_food_with_data -c "\dt"
   ```

2. Update `backend/settings.py` to use PostgreSQL (already configured)

3. Test your Django app:
   ```powershell
   cd backend
   python manage.py runserver
   ```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `host.docker.internal` not found | Use `--add-host=host.docker.internal:host-gateway` (Docker 20.10+) or replace with your machine's IP |
| MySQL connection refused | Ensure MySQL is running: `net start MySQL` or check XAMPP/WAMP |
| PostgreSQL connection refused | Ensure PostgreSQL service is running |
| Permission denied | Ensure MySQL user has SELECT on all tables, PostgreSQL user has CREATE/INSERT |
| Password with special chars | URL-encode the password in the .load file |
