from src import app

@app.route("/")
def index():
    return {"message": "IntelliFactory backend running!"}
    
if __name__ == "__main__":
    app.run(debug=True)
