LAW_DB = {
    "Article 21": "Protection of life and personal liberty under the Constitution of India.",
    "Section 302": "Punishment for murder under the Indian Penal Code."
}

def get_law_info(refs):
    info = {}
    for r in refs:
        if r in LAW_DB:
            info[r] = LAW_DB[r]
        else:
            info[r] = "No description available."
    return info
