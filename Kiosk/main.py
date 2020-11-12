from flask import Flask, request, jsonify
import pyqrcode
#import smbus2
import os



app = Flask(__name__)

queue = list()

# Google Cloud Compute 
host="10.128.0.3"
port=80


# Uncomment when on Raspberry PI
#bus = smbus.SMBus(1)

DESK_ADDRESS_1 = 0x04
DESK_ADDRESS_2 = 0x05

@app.route("/iteratequeue", methods=["GET"])
def iterate():
    return jsonify({"qnumber":1,"address":0x05})

@app.route("/", methods=["POST"])
def detail():
    try:
        qNumber = request.json["qnumber"]
        if (int(qNumber) < 1):
            raise Exception()
    except:
        return jsonify({"response": False})

    if (updateQueue(qNumber)):
        return jsonify({"response": displayQR(qNumber)})

    return jsonify({"response": False})


def updateQueue(newQNumber):
    if (newQNumber not in queue):
        queue.append(newQNumber)
        return True
    return False


def displayQR(qrnum):
    if (int(qrnum) < 1 or qrnum == None):
        return False
    try:
        url = pyqrcode.create(qrnum)        
        print(url.terminal(quiet_zone=1))
        print(queue)
        return True
    except:
        return False




#app.run(host=host,port=port)
app.run(debug=False,port=4000)


