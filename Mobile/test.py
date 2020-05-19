from flask import Flask, request, jsonify


app = Flask(__name__)



@app.route("/", methods=["POST","GET"])
def detail():
    
        return jsonify({
                'Monday': 50,
                'Tuesday': 20,
                'Wednesday': 40,
                'Thursday': 60,
                'Friday': 80,
        })

@app.route("/queue/<code>", methods=["POST","GET"])
def deta(code):
    
        return jsonify({
                "response": True
        })
    



if __name__ == '__main__':
    app.run(debug=True,host="192.168.1.104")