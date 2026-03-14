const recipeInput = document.getElementById("recipeInput");
const extractBtn = document.getElementById("extractBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const shoppingList = document.getElementById("shoppingList");

// Basic ingredient words to help detect lines.
// You can add more over time.
const ingredientHints = [
  "cup", "cups", "tbsp", "tsp", "g", "kg", "ml", "l", "oz", "lb",
  "onion", "garlic", "tomato", "salt", "pepper", "flour", "sugar",
  "butter", "milk", "egg", "eggs", "cheese", "oil", "rice", "pasta",
  "chicken", "beef", "pork", "carrot", "celery", "potato", "cream",
  "lemon", "lime", "paprika", "oregano", "basil", "cumin", "stock"
];

function looksLikeIngredient(line) {
  const lower = line.toLowerCase().trim();

  if (!lower) return false;

  // Ignore obvious method/instruction lines
  if (
    lower.startsWith("method") ||
    lower.startsWith("instructions") ||
    lower.startsWith("step ") ||
    lower.startsWith("cook ") ||
    lower.startsWith("bake ") ||
    lower.startsWith("heat ") ||
    lower.startsWith("mix ")
  ) {
    return false;
  }

  // Detect if it starts with a number/fraction
  const startsWithAmount = /^(\d+|\d+\/\d+|\d+\.\d+)/.test(lower);

  // Detect if line contains common ingredient clues
  const containsHint = ingredientHints.some(word => lower.includes(word));

  return startsWithAmount || containsHint;
}

function extractIngredients(text) {
  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const found = lines.filter(looksLikeIngredient);

  // Remove duplicates
  return [...new Set(found)];
}

function renderList(items) {
  shoppingList.innerHTML = "";

  if (items.length === 0) {
    shoppingList.innerHTML = "<li>No ingredients found. Try pasting a recipe with a clear ingredients section.</li>";
    return;
  }

  items.forEach((item, index) => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `item-${index}`;

    const label = document.createElement("label");
    label.htmlFor = `item-${index}`;
    label.textContent = " " + item;

    li.appendChild(checkbox);
    li.appendChild(label);
    shoppingList.appendChild(li);
  });
}

extractBtn.addEventListener("click", () => {
  const text = recipeInput.value;
  const ingredients = extractIngredients(text);
  renderList(ingredients);
});

copyBtn.addEventListener("click", async () => {
  const items = [...shoppingList.querySelectorAll("label")]
    .map(label => label.textContent.trim());

  if (items.length === 0) {
    alert("Nothing to copy yet.");
    return;
  }

  try {
    await navigator.clipboard.writeText(items.join("\n"));
    alert("Shopping list copied.");
  } catch (err) {
    alert("Copy failed.");
  }
});

clearBtn.addEventListener("click", () => {
  recipeInput.value = "";
  shoppingList.innerHTML = "";
});
