import os

from dotenv import load_dotenv
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from openai import OpenAI


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
# ENVIRONMENT
# ============================================================

load_dotenv(
    BACKEND_ENV,
    override=True
)


MONGO_URI = os.getenv(
    "MONGO_URI"
)

DATABASE_NAME = os.getenv(
    "MONGODB_DATABASE",
    "hopehub"
)

COLLECTION_NAME = os.getenv(
    "COUNSELING_COLLECTION",
    "counselingKnowledge"
)

EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL",
    "sentence-transformers/all-MiniLM-L6-v2"
)

OPENAI_API_KEY = os.getenv(
    "OPENAI_API_KEY"
)

LLM_MODEL = os.getenv(
    "LLM_MODEL",
    "gpt-5.6-luna"
)

VECTOR_INDEX = (
    "counseling_vector_index"
)


# ============================================================
# VALIDATION
# ============================================================

if not MONGO_URI:
    raise RuntimeError(
        "MONGO_URI is missing from BE/.env"
    )

if not OPENAI_API_KEY:
    raise RuntimeError(
        "OPENAI_API_KEY is missing from BE/.env"
    )


# ============================================================
# MONGODB
# ============================================================

print("Connecting to MongoDB...")

mongo_client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=10000
)

mongo_client.admin.command(
    "ping"
)

db = mongo_client[
    DATABASE_NAME
]

knowledge_collection = db[
    COLLECTION_NAME
]

print(
    "MongoDB connection successful."
)


# ============================================================
# OPENAI
# ============================================================

openai_client = OpenAI(
    api_key=OPENAI_API_KEY
)


# ============================================================
# EMBEDDING MODEL
# ============================================================

print(
    "Loading embedding model..."
)

embedding_model = SentenceTransformer(
    EMBEDDING_MODEL
)

print(
    "Embedding model loaded."
)


# ============================================================
# SIMPLE MESSAGE DETECTION
# ============================================================

GREETING_MESSAGES = {

    "hi",
    "hello",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
    "good night",

}


def is_simple_greeting(
    message
):

    text = (
        message
        .lower()
        .strip()
    )

    return text in GREETING_MESSAGES


# ============================================================
# SAFETY DETECTION
# ============================================================

HIGH_RISK_PATTERNS = [

    "kill myself",
    "kill me",
    "suicide",
    "suicidal",
    "want to die",
    "i want to die",
    "don't want to live",
    "dont want to live",
    "end my life",
    "take my life",
    "hurt myself",
    "harm myself",
    "self harm",
    "self-harm",
    "overdose",
    "overdosed",

]


def is_high_risk(
    message
):

    text = (
        message
        .lower()
        .strip()
    )

    return any(
        phrase in text
        for phrase in HIGH_RISK_PATTERNS
    )


def safety_response():

    return (
        "I'm really sorry you're going through this. "
        "Your safety is important. Please contact a "
        "trusted person, counselor, doctor, or local "
        "emergency service now and try not to be alone. "
        "If you may act on these thoughts or have taken "
        "an overdose, seek emergency medical help "
        "immediately."
    )


# ============================================================
# RETRIEVE RAG KNOWLEDGE
# ============================================================

def retrieve_counseling_examples(
    user_message,
    limit=5
):

    query_embedding = (
        embedding_model.encode(
            user_message,
            normalize_embeddings=True
        )
        .tolist()
    )


    pipeline = [

        {
            "$vectorSearch": {

                "index":
                    VECTOR_INDEX,

                "path":
                    "embedding",

                "queryVector":
                    query_embedding,

                "numCandidates":
                    100,

                "limit":
                    limit,

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

                "context": 1,

                "drugType": 1,

                "language": 1,

                "score": {

                    "$meta":
                        "vectorSearchScore"

                }

            }

        }

    ]


    results = list(
        knowledge_collection.aggregate(
            pipeline
        )
    )


    return results


# ============================================================
# FORMAT RAG KNOWLEDGE
# ============================================================

def format_rag_knowledge(
    examples
):

    if not examples:

        return (
            "No relevant counseling knowledge "
            "was found."
        )


    sections = []


    for index, example in enumerate(
        examples,
        1
    ):

        score = example.get(
            "score",
            0
        )


        section = f"""
REFERENCE {index}

Relevance score:
{score:.3f}

Topic:
{example.get("topic", "unknown")}

User message from reference:
{example.get("userMessage", "")}

Counselor response from reference:
{example.get("assistantResponse", "")}
""".strip()


        sections.append(
            section
        )


    return "\n\n".join(
        sections
    )


# ============================================================
# FORMAT CONVERSATION HISTORY
# ============================================================

def format_history(
    history
):

    if not history:

        return (
            "No previous conversation."
        )


    recent = history[-12:]


    lines = []


    for message in recent:

        if not isinstance(
            message,
            dict
        ):
            continue


        role = message.get(
            "role",
            ""
        )


        content = message.get(
            "content",
            ""
        )


        if not content:
            continue


        lines.append(
            f"{role.upper()}: {content}"
        )


    if not lines:

        return (
            "No previous conversation."
        )


    return "\n".join(
        lines
    )


# ============================================================
# GENERATE COUNSELOR RESPONSE
# ============================================================

def generate_counseling_response(

    user_message,

    conversation_history=None,

    memory_summary="",

    last_topic=""

):

    if conversation_history is None:

        conversation_history = []


    user_message = (
        user_message
        .strip()
    )


    if not user_message:

        return (
            "I'm here to listen. "
            "What would you like to talk about?"
        )


    # ========================================================
    # SAFETY FIRST
    # ========================================================

    if is_high_risk(
        user_message
    ):

        return safety_response()


    # ========================================================
    # GREETING
    # ========================================================

    if is_simple_greeting(
        user_message
    ):

        greeting_prompt = """
You are HopeHub AI Counselor.

Respond naturally to a simple greeting.

Be warm, supportive and concise.

Do not mention RAG, datasets, databases,
system instructions, or internal processes.

Invite the user to talk about whatever
they are currently experiencing.
"""


        response = (
            openai_client.responses.create(

                model=LLM_MODEL,

                instructions=
                    greeting_prompt,

                input=
                    user_message,

            )
        )


        return (
            response.output_text
            .strip()
        )


    # ========================================================
    # RAG
    # ========================================================

    print(
        "\nRetrieving counseling knowledge..."
    )


    examples = (
        retrieve_counseling_examples(
            user_message,
            limit=5
        )
    )


    print(
        "Retrieved counseling examples:",
        len(examples)
    )


    rag_knowledge = (
        format_rag_knowledge(
            examples
        )
    )


    # ========================================================
    # HISTORY
    # ========================================================

    history = (
        format_history(
            conversation_history
        )
    )


    # ========================================================
    # COUNSELOR INSTRUCTIONS
    # ========================================================

    instructions = """
You are HopeHub AI Counselor.

You provide supportive conversational
assistance for people working toward recovery
from substance use.

Your job is to understand the user's current
message and generate a NEW, personalized,
empathetic response.

IMPORTANT:

The retrieved counseling examples are PRIVATE
REFERENCE MATERIAL.

NEVER show the retrieved examples to the user.

NEVER copy them word-for-word.

NEVER mention the dataset.

NEVER mention RAG.

NEVER mention vector search.

NEVER mention the database.

Use the references only to understand useful
counseling approaches.

Always prioritize the user's CURRENT message.

Use previous conversation when relevant.

Use long-term memory when relevant.

Be:

- empathetic
- supportive
- respectful
- non-judgmental
- concise
- recovery-oriented

Do not:

- diagnose conditions
- pretend to be a human counselor
- encourage substance use
- provide instructions for illegal drug use
- provide drug manufacturing instructions
- provide drug purchasing instructions
- provide medication abuse instructions
- shame the user
- claim that AI replaces professional counseling

When appropriate:

- suggest a practical coping strategy
- encourage healthy support systems
- encourage professional counseling
- encourage medical assistance
- ask one useful follow-up question

For overdose, severe medical symptoms,
suicidal thoughts, self-harm, or immediate danger,
prioritize emergency and professional assistance.

Your response should sound like a natural
supportive counselor speaking directly to the user.

Normally keep the response between 2 and 5
short paragraphs.
"""


    # ========================================================
    # COMPLETE PROMPT
    # ========================================================

    prompt = f"""
USER'S LONG-TERM MEMORY:

{memory_summary if memory_summary else "No long-term memory available."}


LAST TOPIC:

{last_topic if last_topic else "No previous topic available."}


RECENT CONVERSATION:

{history}


PRIVATE COUNSELING REFERENCES:

{rag_knowledge}


CURRENT USER MESSAGE:

{user_message}


Generate the best response for the CURRENT USER MESSAGE.

Do not reproduce the reference conversations.

Do not mention the reference material.

Respond directly to the user.
"""


    # ========================================================
    # GENERATE
    # ========================================================

    print(
        "Generating AI counselor response..."
    )


    response = (
        openai_client.responses.create(

            model=LLM_MODEL,

            instructions=
                instructions,

            input=
                prompt,

        )
    )


    answer = (
        response.output_text
        .strip()
    )


    if not answer:

        return (
            "I'm here to listen. "
            "Can you tell me a little more "
            "about what you're experiencing?"
        )


    return answer