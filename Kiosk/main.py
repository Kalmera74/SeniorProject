from flask import Flask, request, jsonify
import pyqrcode
import os
import json
import requests

token = ''

app = Flask(__name__)

queue = []

# Google Cloud Compute
host = "168.119.190.83"
port = 80

Desks = list()




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



def authenticateAdmin():

    resp = requests.post("https://senior.fastntech.com/auth/systemLogin",
                         data={
                             "username": "admin",
                             "password": "admin"
                         }
                     )

    global token                         
    token = str(resp.content).replace("b'", '')
    token = token.split(",")[0].split(":")[1]
    


authenticateAdmin()

def authenticateMobile():
    resp = requests.post("https://senior.fastntech.com/auth/mobileLogin", data={
        "nationID":"12312",
        "password":"123456"
        }
    )

    token = str(resp.content).replace("b'",'')
    token = token.split(",")[0].split(":")[1]

    return token


def getFirstQue():
    token = authenticateMobile()
    token = token.replace('"','')
    headers = {"Authentication":token}
    resp = requests.post("https://senior.fastntech.com/api/mobile/qr",headers=headers)
    qnum = str(resp.content).split(":")[1]
    qnum = qnum.split(",")[0]
    updateQueue(int(qnum.replace('"','')))
    displayQR(int(qnum.replace('"','')))



getFirstQue()


@app.route('/remove',methods=['POST'])
def remove():
 qnum = request.json["quenum"]
 print(qnum)
 que.remove(qnum);


@app.route('/updatedesks', methods=['POST'])
def updatedesks():
    file = open("desklist.txt", "w")
    file.write(request.json)


@app.route("/iteratequeue", methods=["GET"])
def iterate():
    return jsonify({"qnumber": queue.pop(0)})


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


app.run(host=host,port=port)
#app.run(debug=False, port=80)