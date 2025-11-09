# scripts/merge_sqlite_tables.py
import sqlite3
import sys

SRC = sys.argv[1] if len(sys.argv) > 1 else "dev.db"
DST = sys.argv[2] if len(sys.argv) > 2 else "legal_ai.db"
TABLES = [
    "users", "user_sessions", "laws", "user_queries",
    "user_feedback", "model_versions", "train_jobs",
    "app_settings", "analytics"
]

def copy_tables(src, dst, tables):
    s = sqlite3.connect(src)
    d = sqlite3.connect(dst)
    s.row_factory = sqlite3.Row
    for t in tables:
        try:
            rows = s.execute(f"SELECT * FROM {t}").fetchall()
        except Exception as e:
            print(f"Skipping {t}: {e}")
            continue
        if not rows:
            print(f"No rows found for {t}, skipping.")
            continue

        cols = rows[0].keys()
        placeholders = ",".join(["?"] * len(cols))
        col_list = ",".join(cols)

        # Use INSERT OR IGNORE to prevent duplicates for tables with unique constraints.
        sql = f"INSERT OR IGNORE INTO {t} ({col_list}) VALUES ({placeholders})"
        count = 0
        for r in rows:
            try:
                d.execute(sql, tuple(r[col] for col in cols))
                count += 1
            except Exception as e:
                # Many reasons can cause failure (schema mismatch). Log and continue.
                print(f"Insert failed for table {t}: {e}")
        d.commit()
        print(f"Copied {count} rows into {t} from {src} -> {dst}")

    s.close()
    d.close()

if __name__ == "__main__":
    copy_tables(SRC, DST, TABLES)