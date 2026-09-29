import os

from dotenv import load_dotenv
from pymongo import MongoClient


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


# ============================================================
# LOAD ENV
# ============================================================

load_dotenv(
    BACKEND_ENV,
    override=True
)


# ============================================================
# CONFIG
# ============================================================

MONGO_URI = os.getenv(
    "MONGO_URI"
)

DATABASE_NAME = os.getenv(
    "MONGODB_DATABASE"
)

COLLECTION_NAME = os.getenv(
    "COUNSELING_COLLECTION"
)


# ============================================================
# VALIDATION
# ============================================================

print("=" * 70)
print("HOPEHUB MONGODB CHECK")
print("=" * 70)

print(
    "\nEnvironment file:"
)

print(
    BACKEND_ENV
)

print(
    "\nDatabase:",
    DATABASE_NAME
)

print(
    "Collection:",
    COLLECTION_NAME
)


if not MONGO_URI:

    raise RuntimeError(
        "MONGO_URI is missing from BE/.env"
    )


if not DATABASE_NAME:

    raise RuntimeError(
        "MONGODB_DATABASE is missing from BE/.env"
    )


if not COLLECTION_NAME:

    raise RuntimeError(
        "COUNSELING_COLLECTION is missing from BE/.env"
    )


# ============================================================
# CONNECT MONGODB
# ============================================================

print(
    "\nConnecting to MongoDB..."
)

client = MongoClient(
    MONGO_URI,

    serverSelectionTimeoutMS=10000
)


# Test connection

client.admin.command(
    "ping"
)


print(
    "MongoDB connection: OK"
)


# ============================================================
# DATABASE
# ============================================================

db = client[
    DATABASE_NAME
]

collection = db[
    COLLECTION_NAME
]


# ============================================================
# COUNT
# ============================================================

count = collection.count_documents({})


print(
    "\nCounseling documents:",
    count
)


# ============================================================
# CHECK DOCUMENT
# ============================================================

if count == 0:

    print(
        "\nWARNING:"
    )

    print(
        "counselingKnowledge is EMPTY."
    )

else:

    print(
        "\nRAG knowledge exists."
    )


    document = collection.find_one(
        {},
        {
            "_id": 0,

            "userMessage": 1,

            "assistantResponse": 1,

            "embedding": 1,

            "topic": 1,

            "source": 1
        }
    )


    if document:

        print(
            "\nFirst document:"
        )

        print(
            "Topic:",
            document.get(
                "topic"
            )
        )

        print(
            "Source:",
            document.get(
                "source"
            )
        )

        print(
            "\nUser message:"
        )

        print(
            document.get(
                "userMessage"
            )
        )

        print(
            "\nCounselor response:"
        )

        print(
            document.get(
                "assistantResponse"
            )
        )


        embedding = document.get(
            "embedding"
        )


        if embedding:

            print(
                "\nEmbedding dimensions:",
                len(embedding)
            )

        else:

            print(
                "\nWARNING: embedding missing."
            )


# ============================================================
# DATABASE COLLECTIONS
# ============================================================

print(
    "\nCollections in database:"
)

for name in db.list_collection_names():

    print(
        " -",
        name
    )


# ============================================================
# COMPLETE
# ============================================================

print("\n" + "=" * 70)

print(
    "DATABASE CHECK COMPLETE"
)

print("=" * 70)


client.close()