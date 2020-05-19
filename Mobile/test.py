from flask import Flask, request, jsonify


app = Flask(__name__)



@app.route("/", methods=["POST","GET"])
def detail():
    
        return jsonify({
                "dayName": "Monday",
                "occpancyRate": 30
                },
                {
                "dayName": "Tuesday",
                "occupancyRate": 40
                })
    



if __name__ == '__main__':
    app.run(debug=True)