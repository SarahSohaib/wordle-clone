# app.py
from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

word_bank = {
    "Fruits": ["apple", "mango", "grape", "peach", "guava"],
    "Animals": ["tiger", "zebra", "panda", "eagle", "koala"],
    "Countries": ["india", "spain", "china", "kenya", "japan"]
}

current_words = {}

def check_guess(answer, guess):
    result = ["absent"] * 5  # Default all to "absent"
    answer_matched = [False] * 5  # Track matched letters in the answer

    # First pass: Check for "correct" matches
    for i in range(5):
        if guess[i] == answer[i]:
            result[i] = "correct"
            answer_matched[i] = True  # Mark this letter as matched

    # Second pass: Check for "present" matches
    for i in range(5):
        if result[i] == "correct":
            continue  # Skip already matched letters
        for j in range(5):
            if guess[i] == answer[j] and not answer_matched[j]:
                result[i] = "present"
                answer_matched[j] = True  # Mark this letter as matched
                break

    return result

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_word", methods=["POST"])
def get_word():
    category = request.json["category"]
    # Always set a new word instead of reusing the old one
    current_words[category] = random.choice(word_bank[category])
    return jsonify({"message": "Word selected."})

@app.route("/guess", methods=["POST"])
def guess():
    data = request.json
    category = data["category"]
    guess = data["guess"].lower()

    if category not in current_words:
        return jsonify({"error": "Word not initialized for this category."}), 400

    answer = current_words[category]

    if len(guess) != 5:
        return jsonify({"error": "Please enter a 5-letter word."}), 400

    if guess == answer:
        current_words.pop(category)
        return jsonify({
            "result": ["correct"] * 5,
            "message": "You guessed it right!",
            "guess": guess  # Optional: for frontend to show guessed word
        })

    result = check_guess(answer, guess)
    return jsonify({
        "result": result,
        "guess": guess  # Optional: include guess to display in frontend
    })

if __name__ == "__main__":
    app.run(debug=True)
