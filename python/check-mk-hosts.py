#!/usr/bin/env python
# Sample program for accessing Livestatus from Python

import json
import os
import socket

from dotenv import load_dotenv
load_dotenv()
host = os.getenv("HOST")
port = int(os.getenv("PORT"))

# for local site only: file path to socket
# address = "%s/tmp/run/live" % os.getenv("OMD_ROOT")
# for local/remote sites: TCP address/port for Livestatus socket
address = (host, port)

# connect to Livestatus
family = socket.AF_INET if type(address) == tuple else socket.AF_UNIX
sock = socket.socket(family, socket.SOCK_STREAM)
sock.connect(address)

# send our request and let Livestatus know we're done
command = "GET hosts\n"
command = command + "Columns: name\n"
command = command + "OutputFormat: json\n"
sock.sendall(command)
sock.shutdown(socket.SHUT_WR)

# receive the reply as a JSON string
chunks = []
while len(chunks) == 0 or chunks[-1] != "":
    chunks.append(sock.recv(4096))
sock.close()
reply = "".join(chunks)

# print the parsed reply
parsed = json.loads(reply)
print(json.dumps(parsed, indent=4, sort_keys=True))
