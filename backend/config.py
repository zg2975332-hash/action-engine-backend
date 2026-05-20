"""
Backend configuration — loads env vars and exposes constants.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the same directory as this file (backend/.env)
_env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=_env_path)

MODEL_NAME: str = os.getenv("MODEL_NAME", "gemini-2.5-flash")
