import json
import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_SOURCE = BASE_DIR / "src" / "data" / "interview-qa.json"


def load_client():
    load_dotenv(BASE_DIR / ".env")
    load_dotenv(BASE_DIR / ".env.local")

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise RuntimeError(
            "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in archelon-learning/.env"
        )

    return create_client(url, key)


def normalize_item(item, index):
    return {
        "order_index": index + 1,
        "question": item["question"],
        "answer": item["answer"],
        "module": item.get("module") or item.get("type") or "Basic",
        "category": item.get("category") or "Uncategorized",
        "tags": item.get("tags") if isinstance(item.get("tags"), list) else [],
        "mark_as_complete": bool(item.get("mark_as_complete", False)),
        "bookmark": bool(item.get("bookmark", False)),
        "notes": item.get("notes") if isinstance(item.get("notes"), list) else [],
    }


def main():
    table_name = os.getenv("SUPABASE_LEARNING_TABLE", "interview_qa")
    source_path = Path(os.getenv("INTERVIEW_QA_SOURCE", DEFAULT_SOURCE))

    if not source_path.exists():
        raise FileNotFoundError(f"Could not find JSON source: {source_path}")

    with source_path.open("r", encoding="utf-8") as file:
        raw_items = json.load(file)

    if not isinstance(raw_items, list):
        raise ValueError("Expected interview-qa.json to contain a JSON array")

    rows = [normalize_item(item, index) for index, item in enumerate(raw_items)]
    client = load_client()

    batch_size = 100
    for start in range(0, len(rows), batch_size):
        batch = rows[start:start + batch_size]
        client.table(table_name).upsert(batch, on_conflict="question").execute()
        print(f"Upserted {start + len(batch)} / {len(rows)} rows")

    print(f"Done. Imported {len(rows)} rows into {table_name}.")


if __name__ == "__main__":
    main()
