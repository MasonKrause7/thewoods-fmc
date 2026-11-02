"""Local preview. Serves the site with shared partials filled in.

    python3 tools/preview.py
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
from includes import ROOT, render_html


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        rel = unquote(urlparse(self.path).path).lstrip("/")
        page = self.page_file(rel)
        if page is None:
            return super().do_GET()
        body = render_html(page.read_text(), page.name).encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def page_file(self, rel):
        if rel == "":
            rel = "index.html"
        candidate = (ROOT / rel).resolve()
        if ROOT not in candidate.parents and candidate != ROOT:
            return None
        if candidate.suffix == ".html" and candidate.is_file():
            return candidate
        html = ROOT / f"{rel}.html"
        if candidate.suffix == "" and html.is_file():
            return html
        return None


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
    server = ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=str(ROOT)))
    print(f"Preview at http://127.0.0.1:{port}")
    server.serve_forever()
