from flask import Flask, jsonify
import pyqrcode


app = Flask(__name__)

@app.route("/newqr/<qnumber>", methods=["GET"])
def user_detail(qnumber):
    printQr(qnumber)
    return jsonify(response=True)


def printQr(qrnum):
    url = pyqrcode.create(qrnum)
    print(url.terminal(quiet_zone=1))




if __name__ == '__main__':
    app.run(debug=False)