
import SimpleHTTPServer
import SocketServer
import os
 
PORT = 8080
 
Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
httpd = SocketServer.TCPServer(("", PORT), Handler)
print "serving at port", PORT
httpd.serve_forever()
