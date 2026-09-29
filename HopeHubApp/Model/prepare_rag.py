import os
import pandas as pd

from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv


# ============================================================
# PATHS
# ============================================================

MODEL_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

PROJECT_DIR = os.path.dirname(
    MODEL_DIR
)

BACKEND_ENV = os.path.join(
    PROJECT_DIR,
    "BE",
    ".env"
)

DATASET_PATH = os.path.join(
    MODEL_DIR,
    "dataset",
    "HopeHub_Drug_Counseling_Big_Dataset.csv"
)


# ============================================================
# LOAD ENV
# ============================================================

print("=" * 70)
print("HOPEHUB RAG DATA PREPARATION")
print("=" * 70)

print(
    f"\nLoading environment:\n{BACKEND_ENV}"
)


if not os.path.exists(BACKEND_ENV):

    raise FileNotFoundError(
        f"Backend .env not found:\n{BACKEND_ENV}"
    )


load_dotenv(
    BACKEND_ENV,
    override=True
)


# ============================================================
# CONFIGURATION
# ============================================================

MONGO_URI = os.getenv(
    "MONGO_URI"
)

DATABASE_NAME = os.getenv(
    "MONGODB_DATABASE",
    "HopeHub"
)

COLLECTION_NAME = os.getenv(
    "COUNSELING_COLLECTION",
    "counselingKnowledge"
)

EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL",
    "sentence-transformers/all-MiniLM-L6-v2"
)


# ============================================================
# VALIDATION
# ============================================================

if not MONGO_URI:

    raise ValueError(
        "MONGO_URI is missing from BE/.env"
    )


if not os.path.exists(DATASET_PATH):

    raise FileNotFoundError(
        f"Dataset not found:\n{DATASET_PATH}"
    )


# ============================================================
# LOAD DATASET
# ============================================================

print(
    "\nLoading counseling dataset..."
)

df = pd.read_csv(
    DATASET_PATH
)

print(
    f"Dataset rows: {len(df)}"
)

print(
    "Dataset columns:"
)

print(
    list(df.columns)
)


# ============================================================
# SUPPORT OLD FORMAT
# ============================================================

if {
    "user_message",
    "assistant_response"
}.issubset(df.columns):

    print(
        "\nUsing enhanced counseling format."
    )


elif {
    "instruction",
    "input",
    "output"
}.issubset(df.columns):

    print(
        "\nUsing instruction/input/output format."
    )

    df = df.rename(
        columns={
            "input": "user_message",
            "output": "assistant_response"
        }
    )


else:

    raise ValueError(
        "\nInvalid dataset.\n\n"
        "Required format:\n"
        "user_message + assistant_response\n\n"
        "OR:\n"
        "instruction + input + output"
    )


# ============================================================
# CLEAN DATA
# ============================================================

df = df.fillna("")


for column in df.columns:

    df[column] = (
        df[column]
        .astype(str)
        .str.strip()
    )


# ============================================================
# ADD METADATA IF NOT AVAILABLE
# ============================================================

defaults = {

    "conversation_id": "dataset",

    "turn_id": "0",

    "topic": "unknown",

    "user_emotion": "unknown",

    "user_intent": "unknown",

    "risk_level": "unknown",

    "counseling_strategy": "unknown",

    "context": "unknown",

    "drug_type": "unknown",

    "language": "English",

    "source": "HopeHub",

}


for column, default in defaults.items():

    if column not in df.columns:

        df[column] = default


# ============================================================
# REMOVE EMPTY ROWS
# ============================================================

before = len(df)

df = df[
    (df["user_message"].str.len() > 0)
    &
    (df["assistant_response"].str.len() > 0)
]

print(
    f"Empty rows removed: "
    f"{before - len(df)}"
)


# ============================================================
# REMOVE DUPLICATES
# ============================================================

before = len(df)

df = df.drop_duplicates(
    subset=[
        "user_message",
        "assistant_response"
    ]
)

print(
    f"Duplicate rows removed: "
    f"{before - len(df)}"
)


df = df.reset_index(
    drop=True
)


print(
    f"Final counseling examples: "
    f"{len(df)}"
)


# ============================================================
# CREATE RAG TEXT
# ============================================================

def create_rag_text(row):

    return f"""
Topic: {row["topic"]}

User emotion: {row["user_emotion"]}

User intent: {row["user_intent"]}

Risk level: {row["risk_level"]}

Counseling strategy:
{row["counseling_strategy"]}

Context:
{row["context"]}

Drug type:
{row["drug_type"]}

Language:
{row["language"]}

User message:
{row["user_message"]}

Counselor response:
{row["assistant_response"]}
""".strip()


df["rag_text"] = df.apply(
    create_rag_text,
    axis=1
)


# ============================================================
# EMBEDDINGS
# ============================================================

print(
    "\nLoading embedding model..."
)

embedding_model = SentenceTransformer(
    EMBEDDING_MODEL
)

print(
    "Creating embeddings..."
)

embeddings = embedding_model.encode(

    df["rag_text"].tolist(),

    normalize_embeddings=True,

    show_progress_bar=True

)

print(
    "\nEmbedding dimensions:",
    len(embeddings[0])
)


# ============================================================
# MONGODB
# ============================================================

print(
    "\nConnecting to MongoDB..."
)

client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=10000
)

client.admin.command(
    "ping"
)

print(
    "MongoDB connection successful."
)


db = client[
    DATABASE_NAME
]

collection = db[
    COLLECTION_NAME
]


# ============================================================
# CLEAR OLD KNOWLEDGE
# ============================================================

print(
    "\nRemoving previous counseling knowledge..."
)

deleted = collection.delete_many({})

print(
    f"Deleted: {deleted.deleted_count}"
)


# ============================================================
# INSERT
# ============================================================

documents = []


for index, row in df.iterrows():

    documents.append({

        "conversationId":
            str(row["conversation_id"]),

        "turnId":
            str(row["turn_id"]),

        "userMessage":
            row["user_message"],

        "assistantResponse":
            row["assistant_response"],

        "topic":
            row["topic"],

        "userEmotion":
            row["user_emotion"],

        "userIntent":
            row["user_intent"],

        "riskLevel":
            row["risk_level"],

        "counselingStrategy":
            row["counseling_strategy"],

        "context":
            row["context"],

        "drugType":
            row["drug_type"],

        "language":
            row["language"],

        "source":
            row["source"],

        "ragText":
            row["rag_text"],

        "embedding":
            embeddings[index].tolist(),

    })


print(
    "\nUploading counseling knowledge..."
)

if documents:

    result = collection.insert_many(
        documents
    )

    print(
        f"Inserted: "
        f"{len(result.inserted_ids)}"
    )


print("\n" + "=" * 70)
print("RAG KNOWLEDGE BASE READY")
print("=" * 70)

print(
    f"Database: {DATABASE_NAME}"
)

print(
    f"Collection: {COLLECTION_NAME}"
)

print(
    f"Documents: "
    f"{collection.count_documents({})}"
)

print(
    f"Embedding dimensions: "
    f"{len(embeddings[0])}"
)

print("=" * 70)


client.close()