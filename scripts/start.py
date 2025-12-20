import subprocess
import time
import os
import signal
import sys

def run_command(command, cwd=None):
    return subprocess.Popen(command, cwd=cwd, shell=True)

def main():
    print("Skipping Docker... (Running in In-Memory/SQLite mode)")
    # subprocess.run("docker-compose up -d", shell=True)

    print("\nStarting Backend (FastAPI)...")
    backend_process = run_command("python -m uvicorn backend.app.main:app --reload --port 8000", cwd=None)

    print("Starting Frontend (Next.js)...")
    # Using 'npm run dev' directly
    frontend_process = run_command("npm run dev", cwd="frontend")

    print("\n\n✅ Services Started!")
    print("Backend: http://localhost:8000/docs")
    print("Frontend: http://localhost:3000")
    print("\nPress Ctrl+C to stop all services.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping services...")
        backend_process.terminate()
        frontend_process.terminate()
        print("Done.")

if __name__ == "__main__":
    main()
