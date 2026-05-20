"""
AetherFlow Backend — FastAPI server with Google ADK agent orchestration.
Exposes REST endpoints for the React Native frontend.
"""
import base64
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse  # ADDED
from fastapi import Request, status  # ADDED
from pydantic import BaseModel
from typing import Optional

# IMPORTANT: Load config FIRST so env vars are set before ADK initializes
import backend.config  # noqa: F401 — sets GOOGLE_API_KEY in os.environ

from backend.agents.pipeline import run_analysis_pipeline, run_simulation_only
from backend.tools.content_tools import extract_text_from_pdf, fetch_url_content
from backend.tools.roman_urdu_translator import translate_roman_urdu_to_english  # ADDED

# ─── App ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="AetherFlow API",
    description="Autonomous Content-to-Action Agent powered by Google ADK",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow mobile app from any origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ADDED: User-Friendly Error Handler
@app.exception_handler(Exception)
async def friendly_exception_handler(request: Request, exc: Exception):
    """
    Convert technical errors into user-friendly messages
    """
    error_message = str(exc)
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    
    # Check for specific error types
    if "429" in error_message or "quota" in error_message.lower() or "rate limit" in error_message.lower():
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "success": False,
                "error": "🤖 AI is busy right now. Try again in 30 seconds or use simpler input.",
                "suggestion": "Wait a moment and try again, or break your content into smaller parts.",
                "help": "You can also try using one of the sample inputs while the AI recovers."
            }
        )
    
    elif "404" in error_message or "not found" in error_message.lower() or "model" in error_message.lower():
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "success": False,
                "error": "🤖 AI model temporarily unavailable. Using backup mode...",
                "suggestion": "The system will retry automatically. Your request is being processed.",
                "help": "If this persists, try refreshing the app or using demo mode."
            }
        )
    
    elif "timeout" in error_message.lower():
        return JSONResponse(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            content={
                "success": False,
                "error": "🤖 Request took too long. The content might be too complex.",
                "suggestion": "Try with shorter content or simpler text.",
                "help": "Break your content into smaller sections and analyze them separately."
            }
        )
    
    elif "api key" in error_message.lower() or "authentication" in error_message.lower():
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "success": False,
                "error": "🤖 AI service configuration issue detected.",
                "suggestion": "The backend needs to be reconfigured. Contact support.",
                "help": "Check that GOOGLE_API_KEY is set in backend/.env file."
            }
        )
    
    # Generic error
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": "🤖 Something went wrong. Our team has been notified.",
            "suggestion": "Try again in a moment. If the issue persists, use demo mode.",
            "help": "You can still explore the app with sample data while we fix this."
        }
    )


# ─── Request / Response Models ───────────────────────────────────────
class AnalyzeRequest(BaseModel):
    content: str
    content_type: str = "text"  # "text" | "pdf" | "url"
    pdf_base64: Optional[str] = None  # Base64-encoded PDF for mobile
    is_roman_urdu: bool = False  # ADDED: Flag for Roman Urdu translation


class SimulateRequest(BaseModel):
    action_id: str
    action_title: str
    action_description: str = ""


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


# ─── Endpoints ───────────────────────────────────────────────────────
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        service="AetherFlow Agent Pipeline",
        version="1.0.0",
    )


@app.post("/api/analyze")
async def analyze_content(request: AnalyzeRequest):
    """
    Main analysis endpoint.
    Accepts text/URL/PDF content and runs the full 6-agent ADK pipeline.
    Returns insights, actions, simulation, outcome, and agent traces.
    """
    content = request.content
    content_type = request.content_type

    # ADDED: Translate Roman Urdu to English if flag is set
    if request.is_roman_urdu:
        original_content = content
        content = translate_roman_urdu_to_english(content)
        print(f"[Roman Urdu Translation] Original: {original_content[:100]}...")
        print(f"[Roman Urdu Translation] Translated: {content[:100]}...")

    # Handle different content types
    if content_type == "url" and content.startswith("http"):
        # Fetch URL content
        fetched = await fetch_url_content(content)
        content = f"[Source URL: {request.content}]\n\n{fetched}"

    elif content_type == "pdf" and request.pdf_base64:
        # Decode and extract PDF text
        try:
            pdf_bytes = base64.b64decode(request.pdf_base64)
            extracted = extract_text_from_pdf(pdf_bytes)
            content = f"[Source: Uploaded PDF]\n\n{extracted}"
        except Exception as e:
            content = f"[PDF processing failed: {str(e)}]\n\nFallback text: {request.content}"

    # Run the full ADK pipeline
    result = await run_analysis_pipeline(content, content_type)

    return {
        "success": True,
        "data": result,
    }


@app.post("/api/simulate")
async def simulate_action(request: SimulateRequest):
    """
    Simulation endpoint.
    Runs the Simulation Engine agent on a specific action.
    Returns before/after state, execution logs, and notifications.
    """
    result = await run_simulation_only(
        action_id=request.action_id,
        action_title=request.action_title,
        action_description=request.action_description,
    )

    return {
        "success": True,
        "data": result,
    }


# ─── File upload endpoint (alternative to base64) ───────────────────
@app.post("/api/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF file directly.
    Extracts text and runs the analysis pipeline.
    """
    pdf_bytes = await file.read()
    extracted = extract_text_from_pdf(pdf_bytes)
    content = f"[Source: {file.filename}]\n\n{extracted}"

    result = await run_analysis_pipeline(content, "pdf")

    return {
        "success": True,
        "data": result,
    }
