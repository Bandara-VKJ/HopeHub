import os

from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv


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


load_dotenv(
    BACKEND_ENV,
    override=True
)


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


if not MONGO_URI:

    raise RuntimeError(
        "MONGO_URI is missing."
    )


client = MongoClient(
    MONGO_URI
)

client.admin.command(
    "ping"
)


collection = client[
    DATABASE_NAME
][
    COLLECTION_NAME
]


print(
    "Loading embedding model..."
)

model = SentenceTransformer(
    EMBEDDING_MODEL
)


print("\n" + "=" * 70)
print("HOPEHUB RAG TEST")
print("=" * 70)


query = input(
    "\nEnter user message: "
).strip()


if not query:

    raise SystemExit(
        "Message cannot be empty."
    )


embedding = model.encode(
    query,
    normalize_embeddings=True
).tolist()


pipeline = [

    {
        "$vectorSearch": {

            "index":
                "counseling_vector_index",

            "path":
                "embedding",

            "queryVector":
                embedding,

            "numCandidates":
                50,

            "limit":
                5

        }
    },

    {
        "$project": {

            "_id": 0,

            "userMessage": 1,

            "assistantResponse": 1,

            "topic": 1,

            "userEmotion": 1,

            "userIntent": 1,

            "riskLevel": 1,

            "counselingStrategy": 1,

            "score": {
                "$meta":
                    "vectorSearchScore"
            }

        }
    }

]


results = list(
    collection.aggregate(
        pipeline
    )
)


print(
    f"\nRetrieved: {len(results)} examples"
)


for i, result in enumerate(
    results,
    1
):

    print(
        f"\n--- RESULT {i} ---"
    )

    print(
        "Score:",
        result.get("score")
    )

    print(
        "Topic:",
        result.get("topic")
    )

    print(
        "Emotion:",
        result.get("userEmotion")
    )

    print(
        "Intent:",
        result.get("userIntent")
    )

    print(
        "Risk:",
        result.get("riskLevel")
    )

    print(
        "\nUSER:"
    )

    print(
        result.get(
            "userMessage"
        )
    )

    print(
        "\nCOUNSELOR:"
    )

    print(
        result.get(
            "assistantResponse"
        )
    )


client.close()