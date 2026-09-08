"""Internal AI service boundary. No trained model is included in the scaffold."""
import hmac
import os
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, ConfigDict

app = FastAPI(title="ERIS AI Service", version="0.1.0")

class PredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    model_version: str
    features: dict[str, int | str]

def authenticate(x_service_token: str | None = Header(default=None)):
    expected = os.environ.get("AI_SERVICE_TOKEN", "")
    if len(expected) < 32:
        raise HTTPException(503, detail={"code": "SERVICE_NOT_CONFIGURED"})
    if not x_service_token or not hmac.compare_digest(x_service_token, expected):
        raise HTTPException(401, detail={"code": "UNAUTHENTICATED"})

@app.get("/health/live")
def live():
    return {"status": "ok"}

@app.get("/health/ready")
def ready():
    raise HTTPException(503, detail={"code": "MODEL_NOT_READY"})

@app.post("/predict", dependencies=[Depends(authenticate)])
def predict(request: PredictionRequest):
    # Implement only after training, evaluation, feature mapping and SHAP output
    # contracts have been agreed. Never substitute random or heuristic scores.
    raise HTTPException(503, detail={"code": "MODEL_NOT_READY"})
