import sqlite3, json, sys

DB = sys.argv[1] if len(sys.argv) > 1 else 'legal_dev.db'
con = sqlite3.connect(DB)
cur = con.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
rows = cur.fetchall()
tables = [r[0] for r in rows]
output = {'db': DB, 'tables': {}}
for t in tables:
    try:
        cur.execute(f"SELECT count(*) FROM {t}")
        c = cur.fetchone()[0]
    except Exception as e:
        c = str(e)
    output['tables'][t] = c
print(json.dumps(output, indent=2))
con.close()