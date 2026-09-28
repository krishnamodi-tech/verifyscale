"""
VerifyScale - SIH 2026 Problem Statement SIH26036 (Team NEXUS NOVA)
Local Prototype Server & Launcher
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Clean terminal logging
        sys.stdout.write(f"[VerifyScale Telemetry] {self.address_string()} - {format%args}\n")
        sys.stdout.flush()

def start_server():
    os.chdir(DIRECTORY)
    
    # Try preferred port, find next available if busy
    port = PORT
    for attempt in range(10):
        try:
            with socketserver.TCPServer(("", port), Handler) as httpd:
                print("=" * 70)
                print("  ⚖️  VERIFYSCALE - SMART INDIA HACKATHON 2026 PROTOTYPE")
                print("  Problem Statement ID: SIH26036 (Team: NEXUS NOVA)")
                print(f"  Live Prototype Running at: http://localhost:{port}")
                print("=" * 70)
                print("  Opening prototype in your default web browser...")
                webbrowser.open(f"http://localhost:{port}")
                print("  Press Ctrl+C to stop the server at any time.")
                print("=" * 70)
                httpd.serve_forever()
                break
        except OSError:
            port += 1

if __name__ == "__main__":
    try:
        start_server()
    except KeyboardInterrupt:
        print("\nVerifyScale server stopped gracefully.")
