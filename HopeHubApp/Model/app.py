import os
import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional


# ============================================================
# LOAD SAVED MODEL COMPONENTS
# ============================================================

model = joblib.load(
    "addiction_rf_model.pkl"
)

label_encoder = joblib.load(
    "addiction_label_encoder.pkl"
)

FEATURE_COLS = joblib.load(
    "feature_columns.pkl"
)


# ============================================================
# NEW MULTI-EMOTION DIARY MODEL
# ============================================================

tfidf_vectorizer = joblib.load(
    "tfidf_vectorizer.pkl"
)

emotion_classifier = joblib.load(
    "emotion_classifier.pkl"
)

label_classes = joblib.load(
    "label_classes.pkl"
)


# ============================================================
# DRUG FREQUENCY → NUMERIC
# ============================================================

DRUG_FREQ_MAP = {
    "Never": 0,
    "Rarely": 1,
    "Sometimes": 2,
    "Often": 4,
    "Very Often": 6,
}


# ============================================================
# KEYWORD BANKS FOR FREE-TEXT → PERSONALITY SCORE
# ============================================================

TRAIT_KEYWORDS = {

    "Nscore": {

        "positive": [
            "anxious",
            "stressed",
            "worry",
            "worried",
            "nervous",
            "unstable",
            "overwhelmed",
            "panic",
            "overthink",
            "overthinking",
            "mood swings",
            "emotional",
            "upset",
            "yes",
            "often",
            "frequently",
            "always",
            "a lot",
            "very",
            "deeply",
            "racing thoughts",
        ],

        "negative": [
            "calm",
            "relaxed",
            "stable",
            "no",
            "never",
            "rarely",
            "not really",
            "not much",
            "barely",
            "seldom",
            "fine",
            "okay",
        ],
    },


    "Escore": {

        "positive": [
            "enjoy",
            "love",
            "energized",
            "social",
            "people",
            "gatherings",
            "outgoing",
            "active",
            "fun",
            "motivated",
            "yes",
            "often",
            "always",
            "definitely",
            "very much",
            "group",
            "friends",
        ],

        "negative": [
            "no",
            "never",
            "rarely",
            "prefer alone",
            "introvert",
            "quiet",
            "shy",
            "uncomfortable",
            "dislike",
            "tired",
            "drain",
            "avoid",
            "not really",
        ],
    },


    "Oscore": {

        "positive": [
            "new",
            "experience",
            "curious",
            "creative",
            "explore",
            "enjoy",
            "love",
            "adventure",
            "different",
            "learn",
            "open",
            "yes",
            "often",
            "try",
            "risk",
            "challenge",
        ],

        "negative": [
            "no",
            "never",
            "prefer routine",
            "boring",
            "same",
            "not interested",
            "avoid",
            "rarely",
            "familiar",
            "safe",
        ],
    },


    "AScore": {

        "positive": [
            "cooperative",
            "empathetic",
            "understand",
            "help",
            "kind",
            "peaceful",
            "avoid conflict",
            "support",
            "care",
            "sensitive",
            "yes",
            "often",
            "always",
            "definitely",
            "friendly",
        ],

        "negative": [
            "no",
            "never",
            "argue",
            "conflict",
            "selfish",
            "aggressive",
            "don't care",
            "ignore",
            "rarely",
            "not really",
        ],
    },


    "Cscore": {

        "positive": [
            "plan",
            "organized",
            "routine",
            "disciplined",
            "responsible",
            "schedule",
            "focused",
            "on time",
            "yes",
            "always",
            "often",
            "definitely",
            "prepare",
            "goal",
        ],

        "negative": [
            "no",
            "never",
            "disorganized",
            "lazy",
            "procrastinate",
            "forget",
            "messy",
            "rarely",
            "not really",
            "skip",
            "miss",
        ],
    },


    "Impulsive": {

        "positive": [
            "impulsive",
            "without thinking",
            "react",
            "regret",
            "quick",
            "immediately",
            "suddenly",
            "burst",
            "yes",
            "often",
            "always",
            "can't control",
            "instantly",
            "emotion",
            "snap",
        ],

        "negative": [
            "no",
            "never",
            "think first",
            "careful",
            "consider",
            "plan",
            "rarely",
            "calm",
            "patient",
            "wait",
            "not really",
        ],
    },


    "SS": {

        "positive": [
            "thrill",
            "exciting",
            "risky",
            "danger",
            "adventure",
            "extreme",
            "adrenaline",
            "love",
            "enjoy",
            "fun",
            "yes",
            "often",
            "always",
            "definitely",
            "dare",
            "bold",
        ],

        "negative": [
            "no",
            "never",
            "safe",
            "boring",
            "avoid",
            "not really",
            "rarely",
            "prefer safe",
            "scared",
            "cautious",
            "fear",
        ],
    },

}


# ============================================================
# PERSONALITY SCORE
# ============================================================

def text_to_personality_score(
    answer_text: str,
    trait: str
) -> float:

    if not answer_text or not answer_text.strip():
        return 0.0


    text = (
        answer_text
        .lower()
        .strip()
    )


    keywords = TRAIT_KEYWORDS.get(
        trait,
        {
            "positive": [],
            "negative": [],
        }
    )


    pos_hits = sum(
        1
        for kw in keywords["positive"]
        if kw in text
    )


    neg_hits = sum(
        1
        for kw in keywords["negative"]
        if kw in text
    )


    net = (
        pos_hits -
        neg_hits
    )


    if net > 0:

        return min(
            2.0,
            0.5 + net * 0.4
        )


    elif net < 0:

        return max(
            -2.0,
            -0.5 + net * 0.4
        )


    return 0.0


# ============================================================
# AVERAGE TRAIT SCORE
# ============================================================

def average_trait_score(
    ans_a: str,
    ans_b: str,
    trait: str
) -> float:

    s1 = text_to_personality_score(
        ans_a,
        trait
    )

    s2 = text_to_personality_score(
        ans_b,
        trait
    )


    return round(
        (s1 + s2) / 2.0,
        5
    )


# ============================================================
# ADDICTION PREDICTION
# ============================================================

def predict_addiction_from_questionnaire(
    answers: dict,
    gender: str = "M"
) -> dict:

    alcohol_raw = answers.get(
        0,
        "Never"
    )

    cannabis_raw = answers.get(
        1,
        "Never"
    )

    coke_raw = answers.get(
        2,
        "Never"
    )

    heroin_raw = answers.get(
        3,
        "Never"
    )

    meth_raw = answers.get(
        4,
        "Never"
    )

    nicotine_raw = answers.get(
        5,
        "Never"
    )


    alcohol_num = DRUG_FREQ_MAP.get(
        alcohol_raw,
        0
    )

    cannabis_num = DRUG_FREQ_MAP.get(
        cannabis_raw,
        0
    )

    coke_num = DRUG_FREQ_MAP.get(
        coke_raw,
        0
    )

    heroin_num = DRUG_FREQ_MAP.get(
        heroin_raw,
        0
    )

    meth_num = DRUG_FREQ_MAP.get(
        meth_raw,
        0
    )

    nicotine_num = DRUG_FREQ_MAP.get(
        nicotine_raw,
        0
    )


    nscore = average_trait_score(
        answers.get(6, ""),
        answers.get(7, ""),
        "Nscore"
    )

    escore = average_trait_score(
        answers.get(8, ""),
        answers.get(9, ""),
        "Escore"
    )

    oscore = average_trait_score(
        answers.get(10, ""),
        answers.get(11, ""),
        "Oscore"
    )

    ascore = average_trait_score(
        answers.get(12, ""),
        answers.get(13, ""),
        "AScore"
    )

    cscore = average_trait_score(
        answers.get(14, ""),
        answers.get(15, ""),
        "Cscore"
    )

    impulsive = average_trait_score(
        answers.get(16, ""),
        answers.get(17, ""),
        "Impulsive"
    )

    ss = average_trait_score(
        answers.get(18, ""),
        answers.get(19, ""),
        "SS"
    )


    gender_num = (
        1
        if gender.upper() == "M"
        else 0
    )


    high_impulsive = (
        1
        if impulsive > 0.5
        else 0
    )


    low_control = (
        1
        if cscore < -0.5
        else 0
    )


    max_drug = max(
        alcohol_num,
        cannabis_num,
        coke_num,
        heroin_num,
        meth_num,
        nicotine_num
    )


    risky_personality = (
        1
        if (
            oscore > 0.5
            and
            ss > 0.5
        )
        else 0
    )


    features = pd.DataFrame([{

        "Gender_Num":
            gender_num,

        "AScore":
            ascore,

        "Nscore":
            nscore,

        "Oscore":
            oscore,

        "Escore":
            escore,

        "Cscore":
            cscore,

        "Impulsive":
            impulsive,

        "SS":
            ss,

        "Nicotine_Num":
            nicotine_num,

        "Meth_Num":
            meth_num,

        "Heroin_Num":
            heroin_num,

        "Cannabis_Num":
            cannabis_num,

        "Coke_Num":
            coke_num,

        "Alcohol_Num":
            alcohol_num,

        "High_Impulsive":
            high_impulsive,

        "Low_Control":
            low_control,

        "Max_Drug":
            max_drug,

        "Risky_Personality":
            risky_personality,

    }])


    features = features[
        FEATURE_COLS
    ]


    pred_encoded = model.predict(
        features
    )[0]


    pred_label = (
        label_encoder
        .inverse_transform(
            [pred_encoded]
        )[0]
    )


    probabilities = (
        model.predict_proba(
            features
        )[0]
    )


    confidence = round(
        float(
            probabilities[
                pred_encoded
            ]
        ) * 100,
        2
    )


    all_probs = {

        label_encoder.classes_[i]:
            round(
                float(p) * 100,
                2
            )

        for i, p in enumerate(
            probabilities
        )

    }


    return {

        "addiction_level":
            pred_label,

        "confidence":
            f"{confidence}%",

        "all_probabilities":
            all_probs,

        "personality_scores": {

            "Nscore (Neuroticism)":
                nscore,

            "Escore (Extraversion)":
                escore,

            "Oscore (Openness)":
                oscore,

            "AScore (Agreeableness)":
                ascore,

            "Cscore (Conscientiousness)":
                cscore,

            "Impulsive":
                impulsive,

            "SS (Sensation Seeking)":
                ss,

        },

        "drug_scores": {

            "Alcohol":
                alcohol_num,

            "Cannabis":
                cannabis_num,

            "Cocaine":
                coke_num,

            "Heroin":
                heroin_num,

            "Meth":
                meth_num,

            "Nicotine":
                nicotine_num,

        },

    }


# ============================================================
# MULTI-EMOTION DIARY PREDICTION
# ============================================================

def predict_diary_emotions(
    text: str
) -> dict:

    """
    Run the existing multi-emotion diary model
    and return percentage breakdown across all
    emotion classes plus the dominant emotion.
    """

    vec = tfidf_vectorizer.transform(
        [text]
    )


    probabilities = (
        emotion_classifier
        .predict_proba(
            vec
        )[0]
    )


    if hasattr(
        label_classes,
        "inverse_transform"
    ):

        classes = (
            label_classes.classes_
        )

    else:

        classes = label_classes


    percentages = {

        classes[i]:
            round(
                float(p) * 100,
                2
            )

        for i, p in enumerate(
            probabilities
        )

    }


    percentages = dict(
        sorted(
            percentages.items(),
            key=lambda kv: -kv[1]
        )
    )


    dominant_emotion = next(
        iter(percentages)
    )


    return {

        "dominant_emotion":
            dominant_emotion,

        "emotion_percentages":
            percentages,

    }


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="HopeHub ML Service"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        "*"
    ],

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],

)


# ============================================================
# AI COUNSELING RAG SERVICE
# ============================================================

try:

    from rag_service import (
        generate_counseling_response
    )


    AI_COUNSELING_AVAILABLE = True


    print(
        "HopeHub AI Counseling RAG service loaded."
    )


except Exception as error:

    AI_COUNSELING_AVAILABLE = False

    generate_counseling_response = None


    print(
        "WARNING: AI Counseling RAG service could not load."
    )

    print(
        repr(error)
    )


# ============================================================
# REQUEST MODELS
# ============================================================

class QuestionnaireRequest(
    BaseModel
):

    userId: Optional[str] = None

    gender: str = "M"

    answers: Dict[str, str]


class DiaryRequest(
    BaseModel
):

    userId: Optional[str] = None

    text: str


# ============================================================
# AI COUNSELING REQUEST MODELS
# ============================================================

class ConversationMessage(
    BaseModel
):

    role: str

    content: str


class AICounselingRequest(
    BaseModel
):

    userId: Optional[str] = None

    message: str

    conversationHistory: List[
        ConversationMessage
    ] = []

    memorySummary: str = ""

    lastTopic: str = ""


# ============================================================
# ROOT / HEALTH
# ============================================================

@app.get("/")
@app.get("/health")
def health():

    return {

        "status":
            "ok",

        "message":
            "HopeHub ML Service is running",

        "aiCounseling":
            AI_COUNSELING_AVAILABLE,

    }


# ============================================================
# QUESTIONNAIRE
# ============================================================

@app.post(
    "/api/questionnaire/submit"
)
def submit_questionnaire(
    payload: QuestionnaireRequest
):

    try:

        int_answers = {

            int(k): v

            for k, v
            in payload.answers.items()

        }

    except ValueError:

        raise HTTPException(

            status_code=400,

            detail=
                "answers keys must be numeric question indices (0-19)"

        )


    if len(int_answers) < 20:

        raise HTTPException(

            status_code=400,

            detail=
                "expected 20 answers (Q0-Q19)"

        )


    result = (
        predict_addiction_from_questionnaire(

            int_answers,

            gender=
                payload.gender

        )
    )


    return {

        "userId":
            payload.userId,

        **result,

    }


# ============================================================
# DIARY EMOTION PREDICTION
# ============================================================

@app.post(
    "/api/diary/predict"
)
def predict_diary_emotion(
    payload: DiaryRequest
):

    text = (
        payload.text
        .strip()
    )


    if not text:

        raise HTTPException(

            status_code=400,

            detail=
                "Diary text is required"

        )


    result = predict_diary_emotions(
        text
    )


    return {

        "userId":
            payload.userId,

        "dominant_emotion":
            result[
                "dominant_emotion"
            ],

        "emotion_percentages":
            result[
                "emotion_percentages"
            ],

    }


# ============================================================
# AI COUNSELING
# ============================================================

@app.post(
    "/api/ai-counseling/chat"
)
def ai_counseling_chat(
    payload: AICounselingRequest
):

    # --------------------------------------------------------
    # Check AI counseling service
    # --------------------------------------------------------

    if not AI_COUNSELING_AVAILABLE:

        raise HTTPException(

            status_code=503,

            detail=
                "AI Counseling service is not available."

        )


    # --------------------------------------------------------
    # Validate message
    # --------------------------------------------------------

    message = (
        payload.message
        .strip()
    )


    if not message:

        raise HTTPException(

            status_code=400,

            detail=
                "Message is required."

        )


    # --------------------------------------------------------
    # Convert conversation history
    # --------------------------------------------------------

    history = [

        {

            "role":
                item.role,

            "content":
                item.content,

        }

        for item
        in payload.conversationHistory

    ]


    # --------------------------------------------------------
    # Generate NEW AI counselor response
    # --------------------------------------------------------

    try:

        response = (
            generate_counseling_response(

                user_message=
                    message,

                conversation_history=
                    history,

                memory_summary=
                    payload.memorySummary,

                last_topic=
                    payload.lastTopic,

            )
        )


    except Exception as error:

        print(
            "AI Counseling error:"
        )

        print(
            repr(error)
        )


        raise HTTPException(

            status_code=500,

            detail=
                "Failed to generate AI counselor response."

        )


    # --------------------------------------------------------
    # Validate generated response
    # --------------------------------------------------------

    if not response:

        raise HTTPException(

            status_code=500,

            detail=
                "AI counselor returned an empty response."

        )


    # --------------------------------------------------------
    # Return only NEW AI response
    # --------------------------------------------------------

    return {

        "success":
            True,

        "userId":
            payload.userId,

        "response":
            response,

    }


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    import uvicorn


    port = int(
        os.getenv(
            "PYTHON_PORT",
            "5001"
        )
    )


    print(
        "=" * 70
    )

    print(
        "HOPEHUB ML SERVICE"
    )

    print(
        "=" * 70
    )

    print(
        f"Starting server on port {port}"
    )

    print(
        "AI Counseling:",
        AI_COUNSELING_AVAILABLE
    )

    print(
        "=" * 70
    )


    uvicorn.run(

        app,

        host="0.0.0.0",

        port=port

    )