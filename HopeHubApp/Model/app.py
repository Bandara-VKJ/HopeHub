from fastapi import FastAPI
from pydantic import BaseModel
import pickle

with open("emotion_model.pkl", "rb") as f:
    model = pickle.load(f)

app = FastAPI()

#sssss
class DiaryRequest(BaseModel):
    text: str


@app.get("/")
def home():
    return {
        "message": "Emotion ML API is running"
    }


@app.post("/predict")
def predict(request: DiaryRequest):

    text = request.text.strip()

    if not text:
        return {
            "error": "Diary text is required"
        }

    probabilities = model.predict_proba([text])[0]

    bad_probability = float(probabilities[0])
    good_probability = float(probabilities[1])

    if good_probability >= 0.60:
        label = "GOOD"
    elif good_probability <= 0.40:
        label = "BAD"
    else:
        label = "NEUTRAL"

    return {
        "label": label,
        "positive_percentage": round(good_probability * 100, 1),
        "negative_percentage": round(bad_probability * 100, 1),
        "confidence": round(
            max(good_probability, bad_probability) * 100,
            1
        )
    }