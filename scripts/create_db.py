"""
Script to create the database declared in backend/config.py.
Tries pymysql, then mysql.connector. Prints clear messages on success/failure.
Run: python scripts\create_db.py
"""
import sys
import traceback

# Try to read backend/config.py directly (avoid import/path issues)
import os
config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend', 'config.py')
if not os.path.exists(config_path):
    print(f"ERROR: backend/config.py not found at expected path: {config_path}")
    sys.exit(2)

cfg = {}
with open(config_path, 'r', encoding='utf-8') as f:
    code = f.read()
    # execute safely in a dict so we can read the constants
    exec(compile(code, config_path, 'exec'), cfg)

DB_NAME = cfg.get('DB_NAME') or cfg.get('SQLALCHEMY_DATABASE_NAME') or cfg.get('DATABASE_NAME') or cfg.get('DB_NAME')
DB_HOST = cfg.get('DB_HOST', '127.0.0.1')
DB_PORT = int(cfg.get('DB_PORT', cfg.get('SQLALCHEMY_DATABASE_PORT', 3306)))
DB_USER = cfg.get('DB_USER', cfg.get('SQLALCHEMY_DATABASE_USER', 'root'))
DB_PASSWORD = cfg.get('DB_PASSWORD', cfg.get('SQLALCHEMY_DATABASE_PASSWORD', ''))

if not DB_NAME:
    print("ERROR: Could not determine DB name from backend.config. Please open backend/config.py and set DB_NAME or SQLALCHEMY_DATABASE_NAME.")
    sys.exit(3)

create_sql = f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
print(f"Attempting to create database '{DB_NAME}' on {DB_HOST}:{DB_PORT} as user '{DB_USER}'")

# Try pymysql first
try:
    import pymysql
    print("Using pymysql to create database...")
    conn = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, port=DB_PORT, charset='utf8mb4')
    cur = conn.cursor()
    cur.execute(create_sql)
    conn.commit()
    cur.close()
    conn.close()
    print(f"SUCCESS: Database '{DB_NAME}' created or already exists.")
    sys.exit(0)
except Exception as e:
    print("pymysql attempt failed:", repr(e))
    # fall through to try mysql.connector

try:
    import importlib
    mysql_connector = importlib.import_module("mysql.connector")
    print("Using mysql.connector to create database...")
    conn = mysql_connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, port=DB_PORT)
    cur = conn.cursor()
    cur.execute(create_sql)
    conn.commit()
    cur.close()
    conn.close()
    print(f"SUCCESS: Database '{DB_NAME}' created or already exists.")
    sys.exit(0)
except Exception as e:
    print("mysql.connector attempt failed:", repr(e))
    print('\nFull traceback:')
    traceback.print_exc()
    print('\nNext steps:')
    print(' - Ensure MySQL server is running and reachable at the host/port in backend/config.py')
    print(' - Ensure the configured user has privileges to CREATE DATABASE')
    print(' - Install a Python DB driver: `pip install pymysql` (preferred) or `pip install mysql-connector-python`')
    print(' - Or, if you prefer to use SQLite for development, set environment variable SQLALCHEMY_DATABASE_URL to a sqlite URL or update backend/config.py to point to sqlite:///path/to/dev.db')
    sys.exit(4)
