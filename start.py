"""
AetherFlow — Single launcher for both Backend + Frontend.
Run this file from the project root to start everything:

    python start.py

Backend will run on: http://localhost:8000
Frontend will run on: http://localhost:8081
"""
import subprocess
import sys
import os
import time
import signal

ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT, "backend")
FRONTEND_DIR = os.path.join(ROOT, "frontend")
VENV_PYTHON = os.path.join(BACKEND_DIR, ".venv", "Scripts", "python.exe")

processes = []


def cleanup(*args):
    print("\n[launcher] Shutting down...")
    for p in processes:
        try:
            p.terminate()
        except Exception:
            pass
    sys.exit(0)


signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)


def main():
    print("=" * 56)
    print("   AetherFlow — Content-to-Action Agent System")
    print("=" * 56)
    print()

    # ── Check backend venv ───────────────────────────────
    if not os.path.exists(VENV_PYTHON):
        print("[launcher] Backend venv not found. Creating...")
        subprocess.run([sys.executable, "-m", "venv", ".venv"], cwd=BACKEND_DIR, check=True)
        print("[launcher] Installing backend dependencies...")
        subprocess.run(
            [VENV_PYTHON, "-m", "pip", "install", "-r", "requirements.txt"],
            cwd=BACKEND_DIR, check=True,
        )

    # ── Check frontend node_modules ──────────────────────
    node_modules = os.path.join(FRONTEND_DIR, "node_modules")
    if not os.path.exists(node_modules):
        print("[launcher] node_modules not found. Running npm install...")
        subprocess.run(["npm", "install"], cwd=FRONTEND_DIR, shell=True, check=True)

    # ── Check .env ───────────────────────────────────────
    env_file = os.path.join(BACKEND_DIR, ".env")
    if os.path.exists(env_file):
        with open(env_file) as f:
            content = f.read()
        if "your_gemini_api_key_here" in content:
            print()
            print("  !! GOOGLE_API_KEY is not set !!")
            print("  Edit backend/.env and paste your Gemini API key.")
            print("  Get one free: https://aistudio.google.com/")
            print()

    # ── Start Backend ────────────────────────────────────
    print("[launcher] Starting backend on http://localhost:8000 ...")
    backend_proc = subprocess.Popen(
        [
            VENV_PYTHON, "-m", "uvicorn",
            "backend.main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload",
        ],
        cwd=ROOT,
    )
    processes.append(backend_proc)

    time.sleep(2)  # Give backend a head start

    # ── Start Frontend ───────────────────────────────────
    print("[launcher] Starting frontend on http://localhost:8081 ...")
    frontend_proc = subprocess.Popen(
        ["npx", "expo", "start", "--web", "--port", "8081"],
        cwd=FRONTEND_DIR,
        shell=True,
    )
    processes.append(frontend_proc)

    print()
    print("-" * 56)
    print("  Backend  : http://localhost:8000")
    print("  Frontend : http://localhost:8081")
    print("  API Docs : http://localhost:8000/docs")
    print("-" * 56)
    print("  Press Ctrl+C to stop both servers")
    print()

    # ── Wait for either to exit ──────────────────────────
    try:
        while True:
            if backend_proc.poll() is not None:
                print("[launcher] Backend exited.")
                break
            if frontend_proc.poll() is not None:
                print("[launcher] Frontend exited.")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()


if __name__ == "__main__":
    main()
