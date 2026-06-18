from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/")
def hello():
  return jsonify(
    message="Welcome to flask application",
    tip="Built with Flask, shipped by Jenkins, running in Docker.",
    UI="This is my new UI, which is built with React and deployed in Docker.UI has been modified again."
  )
if __name__ == "__main__":
  app.run(host="0.0.0.0",port=5000)
