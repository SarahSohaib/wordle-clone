let selectedCategory = null;
let attemptCount = 0;
const maxAttempts = 6;

// Event listener for category selection
document.getElementById("category").addEventListener("change", async function () {
  selectedCategory = this.value;
  attemptCount = 0;

  const response = await fetch("/get_word", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category: selectedCategory }),
  });

  const data = await response.json();

  if (data.message) {
    document.getElementById("game-section").classList.remove("hidden");
    document.getElementById("guess").value = "";
    document.getElementById("grid").innerHTML = "";
    clearKeyboardStates();
  } else {
    alert("Error initializing the word. Please try again.");
  }
});

async function submitGuess() {
  const guessInput = document.getElementById("guess");
  const resultDiv = document.getElementById("grid");
  const guess = guessInput.value.trim().toLowerCase();

  if (!selectedCategory) {
    alert("Please select a category first!");
    return;
  }

  if (guess.length !== 5) {
    alert("Please enter a 5-letter word.");
    return;
  }

  if (attemptCount >= maxAttempts) {
    alert("Game Over! You've used all attempts.");
    return;
  }

  const response = await fetch("/guess", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      category: selectedCategory,
      guess: guess,
    }),
  });

  const data = await response.json();

  if (data.error) {
    alert(data.error);
    return;
  }

  const row = document.createElement("div");
  row.classList.add("row");

  for (let i = 0; i < 5; i++) {
    const box = document.createElement("div");
    box.classList.add("box", data.result[i]);
    box.textContent = guess[i];
    box.style.animationDelay = `${i * 0.2}s`;
    box.classList.add("flip");
    row.appendChild(box);
  }

  resultDiv.appendChild(row);
  guessInput.value = "";
  attemptCount++;

  updateKeyboard(guess, data.result);

  if (data.message) {
    setTimeout(() => {
      alert(data.message);
    }, 100);
  } else if (attemptCount === maxAttempts) {
    setTimeout(() => {
      alert("Out of attempts! Refresh or change category to try again.");
    }, 100);
  }
}

// Allow pressing Enter to submit the guess
document.getElementById("guess").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    submitGuess();
  }
});

document.getElementById("submit-guess").addEventListener("click", submitGuess);

// Update virtual keyboard key colors
function updateKeyboard(guess, result) {
  const keyboard = document.getElementById("keyboard");

  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i];
    const status = result[i];
    const key = keyboard.querySelector(`.key[data-key='${letter}']`);

    if (!key) continue;

    const current = key.dataset.state;

    if (current === "correct") continue;
    if (current === "present" && status === "absent") continue;

    key.classList.remove("absent", "present", "correct");
    key.classList.add(status);
    key.dataset.state = status;
  }
}

function clearKeyboardStates() {
  const keys = document.querySelectorAll(".key");
  keys.forEach(key => {
    key.classList.remove("absent", "present", "correct");
    key.dataset.state = "";
  });
}

// 🔙 Backspace function
function backspace() {
  const input = document.getElementById("guess");
  input.value = input.value.slice(0, -1);
}

// Virtual keyboard key handling
document.querySelectorAll(".key").forEach(key => {
  key.addEventListener("click", () => {
    const input = document.getElementById("guess");
    const value = key.dataset.key;

    if (value === "←") {
      backspace();
    } else if (value === "↵") {
      submitGuess();
    } else if (input.value.length < 5) {
      input.value += value;
    }
  });
});
