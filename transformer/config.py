from pathlib import Path
import torch

# ==========================================================
# Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent

TRAINING_DATA = BASE_DIR / "training_data" / "ForTraining.xlsx"
PREDICTION_DATA = BASE_DIR / "training_data" / "PredictionTraining.xlsx"

CHECKPOINT_DIR = BASE_DIR / "checkpoints"

SUMMARY_CHECKPOINT = CHECKPOINT_DIR / "summarization_model.pt"
PREDICTION_CHECKPOINT = CHECKPOINT_DIR / "prediction_model.pt"
SENTIMENT_CHECKPOINT = CHECKPOINT_DIR / "sentiment_model.pt"

TOKENIZER_PATH = CHECKPOINT_DIR / "tokenizer.pkl"

# ==========================================================
# Device
# ==========================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

# ==========================================================
# Random Seed
# ==========================================================

SEED = 42

# ==========================================================
# Generic Training
# ==========================================================

BATCH_SIZE = 8
EPOCHS = 50
LEARNING_RATE = 5e-4

# ==========================================================
# Summarization Training
# ==========================================================

SUMMARIZATION_BATCH_SIZE = 8
SUMMARIZATION_EPOCHS = 50

# New name
SUMMARIZATION_LEARNING_RATE = 5e-4

# Old name (run_project.py expects this)
SUMMARIZATION_LR = SUMMARIZATION_LEARNING_RATE

# ==========================================================
# Prediction Training
# ==========================================================

PREDICTION_BATCH_SIZE = 8
PREDICTION_EPOCHS = 50

PREDICTION_LEARNING_RATE = 5e-4
PREDICTION_LR = PREDICTION_LEARNING_RATE

# ==========================================================
# Sentiment Training
# ==========================================================

SENTIMENT_BATCH_SIZE = 8
SENTIMENT_EPOCHS = 20

SENTIMENT_LEARNING_RATE = 5e-4
SENTIMENT_LR = SENTIMENT_LEARNING_RATE

# ==========================================================
# Transformer
# ==========================================================

MAX_SRC_LEN = 256
MAX_TGT_LEN = 80

D_MODEL = 256
NUM_HEADS = 8
NUM_LAYERS = 4
D_FF = 512
DROPOUT = 0.1

# ==========================================================
# Sentiment Training & Classification
# ==========================================================

MAX_LEN = MAX_SRC_LEN

SENTIMENT_LABELS = {"negative": 0, "positive": 1}
SENTIMENT_ID_TO_LABEL = {0: "negative", 1: "positive"}

SENTIMENT_DATA = [
    ("Customer is very interested and ready to enroll", "positive"),
    ("Customer complained about price and refused to talk", "negative"),
    ("Great experience, looking forward to starting", "positive"),
    ("Not answering calls, not interested in course", "negative"),
    ("Requested demo class and pricing options", "positive"),
    ("Cancelled enrollment due to personal reasons", "negative")
]

# ==========================================================
# Compatibility aliases
# ==========================================================

SUMMARY_MODEL_PATH = SUMMARY_CHECKPOINT
PREDICTION_MODEL_PATH = PREDICTION_CHECKPOINT
SENTIMENT_MODEL_PATH = SENTIMENT_CHECKPOINT

