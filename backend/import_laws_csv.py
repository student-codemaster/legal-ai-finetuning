import os
import pandas as pd
from sqlalchemy.orm import Session
from .database import SessionLocal, Law

def import_laws_from_csv(csv_path: str):
    """Reads laws_dataset.csv and inserts all laws into the database."""
    if not os.path.exists(csv_path):
        print(f"❌ File not found: {csv_path}")
        return

    df = pd.read_csv(csv_path)
    db: Session = SessionLocal()

    inserted, skipped = 0, 0
    for _, row in df.iterrows():
        law_ref = str(row.get("law_ref")).strip()
        desc = str(row.get("description", "")).strip()
        if not law_ref or not desc:
            continue

        exists = db.query(Law).filter(Law.law_ref == law_ref).first()
        if exists:
            skipped += 1
            continue

        new_law = Law(law_ref=law_ref, description=desc)
        db.add(new_law)
        inserted += 1

    db.commit()
    db.close()
    print(f"✅ Done! Inserted {inserted} new laws, skipped {skipped} existing.")

if __name__ == "__main__":
    csv_file = "backend/data/laws_dataset.csv"  # Adjust if needed
    import_laws_from_csv(csv_file)
