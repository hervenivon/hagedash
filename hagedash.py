#!/usr/bin/env python
import sys
import os
from http.server import HTTPServer as BaseHTTPServer, SimpleHTTPRequestHandler


class HTTPHandler(SimpleHTTPRequestHandler):
    """
    This handler uses server.base_path instead of always using os.getcwd()
    That is natively supported by python3.7
    """
    def translate_path(self, path):
        path = SimpleHTTPRequestHandler.translate_path(self, path)
        relpath = os.path.relpath(path, os.getcwd())
        fullpath = os.path.join(self.server.base_path, relpath)
        return fullpath

class HTTPServer(BaseHTTPServer):
    """The main server, you pass in base_path which is the path you want to serve requests from"""
    def __init__(self, base_path, server_address, RequestHandlerClass=HTTPHandler):
        self.base_path = base_path
        BaseHTTPServer.__init__(self, server_address, RequestHandlerClass)

web_dir = os.path.join(os.path.dirname(__file__), "client/build/")
PORT = 5500
with HTTPServer(web_dir, ("", PORT)) as httpd:
  print(f"Serving HTTP on 0.0.0.0 port {PORT:d} (http://0.0.0.0:{PORT:d}/) ...")
  httpd.serve_forever()
