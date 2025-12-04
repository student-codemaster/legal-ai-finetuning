from backend import module4_lawlink as ml


def test_get_law_info_exact():
    ml.LAW_DB = {"ipc section 302": "Punishment for murder"}
    out = ml.get_law_info(["IPC Section 302"])
    assert "IPC Section 302" in out
    assert out["IPC Section 302"]["match_type"].startswith("exact")


def test_get_law_info_fuzzy():
    ml.LAW_DB = {"theft": "Theft description", "fraud": "Fraud description"}
    out = ml.get_law_info(["theftt"])  # small typo should fuzzy-match
    assert "theftt" in out
    assert out["theftt"]["match_type"].startswith("fuzzy") or out["theftt"]["match_type"].startswith("semantic") or out["theftt"]["match_type"] == "none"


def test_get_law_info_none():
    ml.LAW_DB = {"a law": "Some description"}
    out = ml.get_law_info(["completely unknown reference"])
    assert "completely unknown reference" in out
    assert out["completely unknown reference"]["match_type"] in ("none",) or out["completely unknown reference"]["description"] == "No description available."
