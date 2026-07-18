"""
Utility Helper Functions
--------------------------------
Common helper functions used
throughout the application.
"""

import re
import os
import json
from datetime import datetime


# ============================================
# WORD COUNT
# ============================================

def word_count(text: str) -> int:

    if not text:
        return 0

    return len(text.split())


# ============================================
# CHARACTER COUNT
# ============================================

def character_count(text: str) -> int:

    if not text:
        return 0

    return len(text)


# ============================================
# READING TIME
# ============================================

def reading_time(text: str):

    words = word_count(text)

    minutes = max(1, round(words / 200))

    return minutes


# ============================================
# CLEAN TEXT
# ============================================

def clean_text(text):

    if not text:

        return ""

    text = re.sub(r"\n{3,}", "\n\n", text)

    text = re.sub(r"[ \t]+", " ", text)

    return text.strip()


# ============================================
# CURRENT TIMESTAMP
# ============================================

def current_timestamp():

    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


# ============================================
# SAVE RESEARCH
# ============================================

def save_research(query, report):

    folder = "research_history"

    os.makedirs(folder, exist_ok=True)

    filename = datetime.now().strftime("%Y%m%d_%H%M%S") + ".txt"

    path = os.path.join(folder, filename)

    with open(path, "w", encoding="utf-8") as f:

        f.write(f"Query:\n{query}\n\n")

        f.write(report)

    return path


# ============================================
# SAVE JSON
# ============================================

def save_json(data, filename):

    with open(filename, "w", encoding="utf-8") as f:

        json.dump(data, f, indent=4)


# ============================================
# LOAD JSON
# ============================================

def load_json(filename):

    if not os.path.exists(filename):

        return {}

    with open(filename, "r", encoding="utf-8") as f:

        return json.load(f)


# ============================================
# FORMAT SOURCES
# ============================================

def format_sources(results):

    sources = []

    for item in results:

        sources.append({

            "title": item.get("title", "Unknown"),

            "url": item.get("url", "")

        })

    return sources


# ============================================
# REPORT STATISTICS
# ============================================

def report_statistics(report, sources):

    return {

        "words": word_count(report),

        "characters": character_count(report),

        "reading_time": reading_time(report),

        "sources": len(sources)

    }