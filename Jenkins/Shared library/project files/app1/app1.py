from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/")
def hello():
    return jsonify(
        app="app1",
        message="Welcome to Harish - app1",
        subtitle="Your frined demo microservice",
        tip="Built with Flask, shipped by Jenkins, running in Docker"
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0",port=5000)
