import os
import sys
import torch
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
TRANSFORMER_DIR = BASE_DIR / "transformer"


class TransformerService:
    _model = None
    _tokenizer = None
    _device = None
    _generate_summary_fn = None
    _loaded = False

    @classmethod
    def initialize_model(cls):
        if cls._loaded and cls._model is not None:
            return True

        cls._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Determine checkpoint path: prefer prediction_model.pt if non-empty, else summarization_model.pt
        prediction_ckpt = TRANSFORMER_DIR / "checkpoints" / "prediction_model.pt"
        summarization_ckpt = TRANSFORMER_DIR / "checkpoints" / "summarization_model.pt"

        checkpoint_path = summarization_ckpt
        if prediction_ckpt.exists() and prediction_ckpt.stat().st_size > 0:
            checkpoint_path = prediction_ckpt
        elif summarization_ckpt.exists() and summarization_ckpt.stat().st_size > 0:
            checkpoint_path = summarization_ckpt

        if not checkpoint_path.exists() or checkpoint_path.stat().st_size == 0:
            print(f"Transformer Checkpoint file missing or empty at {checkpoint_path}")
            return False

        try:
            print(f"Loading Transformer model checkpoint from: {checkpoint_path.name}")

            # Save conflicting backend modules from sys.modules
            orig_path = list(sys.path)
            b_config = sys.modules.pop('config', None)
            b_models = sys.modules.pop('models', None)

            # Clear cached transformer submodules if any
            for k in list(sys.modules.keys()):
                if k in ('utils', 'tasks', 'checkpoint', 'run_project') or k.startswith('tasks.') or k.startswith('utils.'):
                    sys.modules.pop(k, None)

            try:
                transformer_str = str(TRANSFORMER_DIR)
                if transformer_str in sys.path:
                    sys.path.remove(transformer_str)
                sys.path.insert(0, transformer_str)

                from run_project import load_checkpoint
                from tasks.summarization import generate_summary

                task, model, tokenizer, _ = load_checkpoint(str(checkpoint_path), cls._device)
                cls._model = model
                cls._tokenizer = tokenizer
                cls._generate_summary_fn = staticmethod(generate_summary)
                cls._loaded = True
                print("Transformer model loaded successfully!")
                return True
            finally:
                # Restore sys.path and backend modules
                sys.path = orig_path
                for k in ('config', 'models', 'utils', 'tasks', 'checkpoint', 'run_project'):
                    sys.modules.pop(k, None)
                if b_config is not None:
                    sys.modules['config'] = b_config
                if b_models is not None:
                    sys.modules['models'] = b_models

        except Exception as e:
            print(f"Error loading Transformer model: {e}")
            return False

    @classmethod
    def summarize_comment(cls, comment_text):
        if not comment_text or not str(comment_text).strip():
            return "No comments provided to summarize."

        if not cls.initialize_model():
            return "Summary unavailable (Transformer model checkpoint not ready)."

        try:
            summary = cls._generate_summary_fn(
                model=cls._model,
                tokenizer=cls._tokenizer,
                text=str(comment_text).strip(),
                max_src_len=256,
                max_tgt_len=80,
                device=cls._device
            )
            return summary.strip() if summary else "Could not generate summary."
        except Exception as e:
            print(f"Error during Transformer summarization: {e}")
            return "Failed to generate summary due to processing error."

    @classmethod
    def predict_lead(cls, comment_text):
        if not comment_text or not str(comment_text).strip():
            return {
                "prediction": "Unknown",
                "recommended_action": "No comments available for prediction."
            }

        orig_path = list(sys.path)
        b_config = sys.modules.pop('config', None)
        b_models = sys.modules.pop('models', None)

        for k in list(sys.modules.keys()):
            if k in ('utils', 'tasks', 'checkpoint', 'run_project') or k.startswith('tasks.') or k.startswith('utils.'):
                sys.modules.pop(k, None)

        try:
            transformer_str = str(TRANSFORMER_DIR)
            if transformer_str in sys.path:
                sys.path.remove(transformer_str)
            sys.path.insert(0, transformer_str)

            from run_project import prediction_chetan
            pred, act = prediction_chetan(comment_text)
            return {
                "prediction": pred,
                "recommended_action": act
            }
        except Exception as e:
            print(f"Error during lead prediction: {e}")
            return {
                "prediction": "Unknown",
                "recommended_action": "Review manually."
            }
        finally:
            sys.path = orig_path
            for k in ('config', 'models', 'utils', 'tasks', 'checkpoint', 'run_project'):
                sys.modules.pop(k, None)
            if b_config is not None:
                sys.modules['config'] = b_config
            if b_models is not None:
                sys.modules['models'] = b_models

