import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import backend.app as app_mod
from backend import database as db_mod


def make_inmemory_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    # create tables
    db_mod.Base.metadata.create_all(bind=engine)
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


def test_process_text_basic(monkeypatch):
    # Replace SessionLocal used by the app with an in-memory session
    app_mod.SessionLocal = make_inmemory_session()

    # Monkeypatch processing and ML functions to avoid heavy deps
    monkeypatch.setattr("backend.module2_processing.clean_text", lambda t: t)
    monkeypatch.setattr("backend.module2_processing.preprocess_for_ai", lambda t: t)
    monkeypatch.setattr("backend.module2_processing.extract_articles", lambda t: [])

    monkeypatch.setattr("backend.module3_ai.summarize_text", lambda text, output_lang=None: "TEST_SUMMARY")
    monkeypatch.setattr("backend.module3_ai.simplify_text", lambda text, output_lang=None: "TEST_SIMPLIFIED")

    monkeypatch.setattr("backend.module4_lawlink.get_law_info", lambda refs: {"no": {"description": "No description available.", "match_type": "none"}})

    async def run():
        res = await app_mod.process_text({"text": "This is a test."})
        assert res["summary"] == "TEST_SUMMARY"
        assert res["simplified"] == "TEST_SIMPLIFIED"

    asyncio.run(run())
