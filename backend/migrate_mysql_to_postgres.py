#!/usr/bin/env python
"""
MySQL to PostgreSQL migration script using SQLAlchemy + pandas.
Run: python migrate_mysql_to_postgres.py

Requires: pip install pandas sqlalchemy pymysql psycopg2-binary
"""
import subprocess
import sys

def main():
    # Install deps if needed
    try:
        import pandas as pd
        from sqlalchemy import create_engine, MetaData, text
    except ImportError:
        print("Installing required packages...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas", "sqlalchemy", "pymysql", "psycopg2-binary", "-q"])
        import pandas as pd
        from sqlalchemy import create_engine, MetaData, text

    MYSQL_URL = "mysql+pymysql://root:86604%40Ga@127.0.0.1:3306/db_food_with_data"
    PG_URL = "postgresql://postgres:1234@127.0.0.1:5432/db_food_with_data"

    print("Connecting to MySQL...")
    mysql_engine = create_engine(MYSQL_URL)
    print("Connecting to PostgreSQL...")
    pg_engine = create_engine(PG_URL)

    # Clean slate: drop and recreate public schema to avoid FK conflicts
    if "--clean" in sys.argv:
        print("Dropping existing tables (--clean)...")
        with pg_engine.connect() as conn:
            conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"))
            conn.commit()

    with mysql_engine.connect() as conn:
        result = conn.execute(text("SHOW TABLES"))
        tables = [row[0] for row in result]

    print(f"Found {len(tables)} tables to migrate")

    for i, table in enumerate(tables, 1):
        try:
            print(f"[{i}/{len(tables)}] Migrating {table}...", end=" ")
            df = pd.read_sql_table(table, mysql_engine)
            df.to_sql(table, pg_engine, if_exists="replace", index=False, method="multi", chunksize=1000)
            print(f"OK ({len(df)} rows)")
        except Exception as e:
            print(f"FAILED: {e}")

    print("\nMigration complete!")

if __name__ == "__main__":
    main()
