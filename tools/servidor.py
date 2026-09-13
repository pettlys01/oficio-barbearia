# Servidor local de desenvolvimento sem cache: o http.server padrão não manda
# Cache-Control, e o navegador seguia mostrando HTML e fotos antigas depois de trocar.
# Uso: python tools/servidor.py  →  http://127.0.0.1:8765
import http.server
import functools
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


class SemCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


http.server.ThreadingHTTPServer(('127.0.0.1', 8765), functools.partial(SemCache, directory=str(RAIZ))).serve_forever()
