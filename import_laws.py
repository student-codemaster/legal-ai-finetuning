# import_laws.py
import pandas as pd
from database import SessionLocal, Law
from sqlalchemy.exc import IntegrityError

def import_csv(csv_path="backend/laws_dataset.csv"):
    df = pd.read_csv(csv_path, dtype=str).fillna("")
    # Normalize column names if needed
    cols = [c.lower() for c in df.columns]
    # try to map typical names
    if "law_ref" in cols:
        ref_col = df.columns[cols.index("law_ref")]
    elif "law_reference" in cols:
        ref_col = df.columns[cols.index("law_reference")]
    else:
        ref_col = df.columns[0]

    if "description" in cols:
        desc_col = df.columns[cols.index("description")]
    elif "law_description" in cols:
        desc_col = df.columns[cols.index("law_description")]
    else:
        desc_col = df.columns[1] if df.shape[1] > 1 else df.columns[0]

    db = SessionLocal()
    added = 0
    for _, row in df.iterrows():
        ref = str(row[ref_col]).strip()
        desc = str(row[desc_col]).strip()
        if not ref or not desc:
            continue
        law = Law(law_ref=ref, description=desc)
        db.add(law)
        try:
            db.commit()
            added += 1
        except IntegrityError:
            db.rollback()
    db.close()
    print(f"Imported {added} laws.")

if __name__ == "__main__":
    import_csv()
