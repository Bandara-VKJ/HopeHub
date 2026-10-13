import os
import pickle
import re
import unicodedata
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scipy.sparse import hstack

BASE_DIR = Path(__file__).parent


def _load_pickle(name: str):
    with open(BASE_DIR / name, "rb") as f:
        return pickle.load(f)


# ============================================================
# ADDICTION LEVEL - CASCADE RANDOM FOREST (15-question version)
# ============================================================

bundle = _load_pickle("hopehub_cascade_rf.pkl")

CASCADE_LAYERS = bundle["layers"]       
FEATURE_NAMES = bundle["feature_names"]
LEVEL_NAMES = bundle["level_names"]     
MAPS = bundle["maps"]                    
COPING_OPTIONS = bundle["coping_options"]


INDEX_TO_FEATURE = {
    0: ("Q1_Alcohol", MAPS["freq"]),
    1: ("Q2_Cannabis", MAPS["freq"]),
    2: ("Q3_Cocaine", MAPS["freq"]),
    3: ("Q4_Heroin", MAPS["freq"]),
    4: ("Q5_Methamphetamine", MAPS["freq"]),
    5: ("Q6_Nicotine", MAPS["freq"]),
    6: ("Q7_Other_Drug_Frequency", MAPS["freq"]),
    7: ("S1_Life_Impact", MAPS["sym"]),
    8: ("S2_Loss_of_Control", MAPS["sym"]),
    9: ("S3_Others_Concern", MAPS["sym"]),
    10: ("S4_Withdrawal", MAPS["sym"]),
    11: ("C1_Impulsivity", MAPS["freq"]),
    12: ("C2_Sensation_Seeking", MAPS["freq"]),
    14: ("C4_Drug_Use_Change", MAPS["change"]),
}
COPING_INDEX = 13 

DEFAULTS = {"C4_Drug_Use_Change": MAPS["change"]["No change"]}

DRUG_SCORE_NAMES = {
    "Alcohol": "Q1_Alcohol",
    "Cannabis": "Q2_Cannabis",
    "Cocaine": "Q3_Cocaine",
    "Heroin": "Q4_Heroin",
    "Meth": "Q5_Methamphetamine",
    "Nicotine": "Q6_Nicotine",
    "Other": "Q7_Other_Drug_Frequency",
}


def _lookup(mapping: Dict[str, int], raw: str):
    """Case-insensitive lookup into a value map (e.g. 'Very often' vs 'Very Often')."""
    wanted = str(raw).strip().lower()
    for k, v in mapping.items():
        if k.lower() == wanted:
            return v
    return None


def encode_answers(answers: Dict[int, str]) -> Dict[str, float]:
    feats: Dict[str, float] = {}

    for idx, (name, mapping) in INDEX_TO_FEATURE.items():
        raw = answers.get(idx)
        if raw is None or str(raw).strip() == "":
            feats[name] = DEFAULTS.get(name, 0)
            continue
        value = _lookup(mapping, raw)
        if value is None:
            raise HTTPException(
                status_code=422,
                detail=f"Unrecognised value '{raw}' for question {idx}",
            )
        feats[name] = value

    coping_raw = (answers.get(COPING_INDEX) or "").strip()
    coping = next((o for o in COPING_OPTIONS if o.lower() == coping_raw.lower()), None)
    if coping_raw and coping is None:
        raise HTTPException(
            status_code=422,
            detail=f"Unrecognised value '{coping_raw}' for question {COPING_INDEX}",
        )
    for opt in COPING_OPTIONS:
        feats[f"Coping_{opt}"] = int(opt == coping)

    return feats


def predict_addiction_from_questionnaire(answers: Dict[int, str]) -> dict:
    feats = encode_answers(answers)
    x = np.array([[feats[f] for f in FEATURE_NAMES]], dtype=float)

    # Cascade: each layer sees the original features + previous layer's probabilities
    inp = x
    p = None
    for models in CASCADE_LAYERS:
        p = np.mean([m.predict_proba(inp) for m in models], axis=0)
        inp = np.hstack([x, p])
    p = p[0]

    level_idx = int(p.argmax())

    return {
        "addiction_level": LEVEL_NAMES[level_idx],
        "level_number": level_idx + 1,
        "confidence": f"{round(float(p[level_idx]) * 100, 2)}%",
        "all_probabilities": {
            LEVEL_NAMES[i]: round(float(v) * 100, 2) for i, v in enumerate(p)
        },
        # The new questionnaire has no personality questions
        "personality_scores": None,
        "drug_scores": {label: feats[col] for label, col in DRUG_SCORE_NAMES.items()},
    }


# ============================================================
# MULTI-EMOTION DIARY PREDICTION
# ============================================================

_SINHALA_RANGE = "\u0D80-\u0DFF"

diary_model = _load_pickle("diary_emotion_model.pkl")
diary_word_vec = _load_pickle("diary_emotion_word_vectorizer.pkl")
diary_char_vec = _load_pickle("diary_emotion_char_vectorizer.pkl")


# Must stay identical to clean_text in the notebook (cell 4)
def diary_clean_text(text: str) -> str:
    text = unicodedata.normalize("NFC", str(text)).lower()
    text = text.replace("\u200c", "")
    text = re.sub(rf"[^a-z{_SINHALA_RANGE}\u200d\s']", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def predict_diary_emotions(text: str) -> dict:
    """Return the percentage breakdown across all emotion classes plus the dominant one."""
    cleaned = diary_clean_text(text)
    if not cleaned:
        raise HTTPException(status_code=400, detail="Diary text is empty")

    vec = hstack([
        diary_word_vec.transform([cleaned]),
        diary_char_vec.transform([cleaned]),
    ]).tocsr()

    probabilities = diary_model.predict_proba(vec)[0]
    ranked = sorted(zip(diary_model.classes_, probabilities), key=lambda x: -x[1])

    percentages = {str(e): round(float(p) * 100, 2) for e, p in ranked}
    return {
        "dominant_emotion": next(iter(percentages)),
        "emotion_percentages": percentages,
    }


app = FastAPI(title="HopeHub ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# AI COUNSELING RAG SERVICE
# ============================================================

try:
    from rag_service import generate_counseling_response

    AI_COUNSELING_AVAILABLE = True
    print("HopeHub AI Counseling RAG service loaded.")

except Exception as error:
    AI_COUNSELING_AVAILABLE = False
    generate_counseling_response = None
    print("WARNING: AI Counseling RAG service could not load.")
    print(repr(error))


# ============================================================
# REQUEST MODELS
# ============================================================

class QuestionnaireRequest(BaseModel):
    userId: Optional[str] = None
    answers: Dict[str, str]
    otherDrugName: Optional[str] = ""


class DiaryRequest(BaseModel):
    userId: Optional[str] = None
    text: str


class ConversationMessage(BaseModel):
    role: str
    content: str


class AICounselingRequest(BaseModel):
    userId: Optional[str] = None
    message: str
    conversationHistory: List[ConversationMessage] = []
    memorySummary: str = ""
    lastTopic: str = ""


# ============================================================
# ROOT / HEALTH
# ============================================================

@app.get("/")
@app.get("/health")
def health():
    return {
        "status": "ok",
        "message": "HopeHub ML Service is running",
        "aiCounseling": AI_COUNSELING_AVAILABLE,
    }


# ============================================================
# QUESTIONNAIRE
# ============================================================

@app.post("/api/questionnaire/submit")
def submit_questionnaire(payload: QuestionnaireRequest):
    try:
        int_answers = {int(k): v for k, v in payload.answers.items()}
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="answers keys must be numeric question indices (0-14)",
        )

    if any(k < 0 or k > 14 for k in int_answers):
        raise HTTPException(
            status_code=400,
            detail="answers keys must be between 0 and 14",
        )

    if not any(str(v).strip() for v in int_answers.values()):
        raise HTTPException(
            status_code=400,
            detail="at least one answer is required",
        )

    result = predict_addiction_from_questionnaire(int_answers)

    return {
        "userId": payload.userId,
        **result,
    }


# ============================================================
# DIARY EMOTION PREDICTION
# ============================================================

@app.post("/api/diary/predict")
def predict_diary_emotion(payload: DiaryRequest):
    text = payload.text.strip()

    if not text:
        raise HTTPException(status_code=400, detail="Diary text is required")

    result = predict_diary_emotions(text)

    return {
        "userId": payload.userId,
        "dominant_emotion": result["dominant_emotion"],
        "emotion_percentages": result["emotion_percentages"],
    }


# ============================================================
# AI COUNSELING
# ============================================================

@app.post("/api/ai-counseling/chat")
def ai_counseling_chat(payload: AICounselingRequest):
    if not AI_COUNSELING_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="AI Counseling service is not available.",
        )

    message = payload.message.strip()

    if not message:
        raise HTTPException(status_code=400, detail="Message is required.")

    history = [
        {"role": item.role, "content": item.content}
        for item in payload.conversationHistory
    ]

    try:
        response = generate_counseling_response(
            user_message=message,
            conversation_history=history,
            memory_summary=payload.memorySummary,
            last_topic=payload.lastTopic,
        )
    except Exception as error:
        print("AI Counseling error:")
        print(repr(error))
        raise HTTPException(
            status_code=500,
            detail="Failed to generate AI counselor response.",
        )

    if not response:
        raise HTTPException(
            status_code=500,
            detail="AI counselor returned an empty response.",
        )

    return {
        "success": True,
        "userId": payload.userId,
        "response": response,
    }


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PYTHON_PORT", "5001"))

    print("=" * 70)
    print("HOPEHUB ML SERVICE")
    print("=" * 70)
    print(f"Starting server on port {port}")
    print("AI Counseling:", AI_COUNSELING_AVAILABLE)
    print("=" * 70)

    uvicorn.run(app, host="0.0.0.0", port=port)