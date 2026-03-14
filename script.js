const mealInput = document.getElementById("mealInput");
const servingsInput = document.getElementById("servings");
const generateBtn = document.getElementById("generateBtn");
const addMealBtn = document.getElementById("addMealBtn");
const shoppingList = document.getElementById("shoppingList");
const mealChips = document.getElementById("mealChips");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const statusEl = document.getElementById("status");

let meals = [];
let items = [];

function setStatus(text) {
  statusEl.textContent = text;
}

function capitalise(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function normaliseCategory(category) {
  const value = String(category || "Other").trim().toLowerCase();

  if (value === "produce") return "Produce";
  if (value === "meat") return "Meat";
  if (value === "dairy") return "Dairy";
  if (value === "pantry") return "Pantry";
  if (value === "condiments") return "Condiments";
  return "Other";
}

function categoryClass(category) {
  return `category-${normaliseCategory(category).toLowerCase()}`;
}

function renderMealChips() {
  mealChips.innerHTML = "";

  meals.forEach((meal) => {
    const chip = document.createElement("div");
    chip.className = "meal-chip";
    chip.textContent = `🍽 ${meal}`;
    mealChips.appendChild(chip);
  });
}

function render() {
  shoppingList.innerHTML = "";

  if (!items.length) {
    shoppingList.innerHTML = `
      <div class="empty-state">
        Enter a meal above and generate a shopping list.
      </div>
    `;
    return;
  }

  const grouped = {};

  items.forEach((item) => {
    const category = normaliseCategory(item.category);
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(item);
  });

  const preferredOrder = ["Produce", "Meat", "Dairy", "Pantry", "Condiments", "Other"];

  preferredOrder.forEach((category) => {
    if (!grouped[category] || grouped[category].length === 0) return;

    const block = document.createElement("section");
    block.className = `category-block ${categoryClass(category)}`;

    const header = document.createElement("div");
    header.className = "category-header";

    const dot = document.createElement("span");
    dot.className = "category-dot";

    const title = document.createElement("h3");
    title.className = "category-title";
    title.textContent = category;

    header.appendChild(dot);
    header.appendChild(title);
    block.appendChild(header);

    const tableWrap = document.createElement("div");
    tableWrap.className = "table-wrap";

    const table = document.createElement("table");
    table.className = "shopping-table";

    table.innerHTML = `
      <thead>
        <tr>
          <th class="col-check"></th>
          <th>Ingredient</th>
          <th>Amount</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    grouped[category].forEach((item, index) => {
      const tr = document.createElement("tr");

      const tdCheck = document.createElement("td");
      tdCheck.className = "col-check";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "item-checkbox";
      checkbox.id = `${category}-${index}-${item.name}`;

      tdCheck.appendChild(checkbox);

      const tdName = document.createElement("td");
      tdName.className = "ingredient-cell";

      const ingredientName = document.createElement("span");
      ingredientName.className = "ingredient-name";
      ingredientName.textContent = capitalise(item.name);

      tdName.appendChild(ingredientName);

      const tdAmount = document.createElement("td");
      tdAmount.className = "amount-cell";
      tdAmount.textContent = item.amount || "—";

      const tdNotes = document.createElement("td");
      tdNotes.className = "notes-cell";
      tdNotes.textContent = item.notes || "—";

      tr.appendChild(tdCheck);
      tr.appendChild(tdName);
      tr.appendChild(tdAmount);
      tr.appendChild(tdNotes);

      tbody.appendChild(tr);
    });

    tableWrap.appendChild(table);
    block.appendChild(tableWrap);
    shoppingList.appendChild(block);
  });
}

async function generateMeal(meal) {
  setStatus("Generating shopping list...");

  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      mealName: meal,
      servings: Number(servingsInput.value)
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Generation failed.");
  }

  items = [...items, ...data.items];
  render();
  setStatus(`Done. Generated ${data.items.length} ingredients.`);
}

generateBtn.addEventListener("click", async () => {
  const meal = mealInput.value.trim();

  if (!meal) {
    setStatus("Enter a meal name first.");
    return;
  }

  generateBtn.disabled = true;

  try {
    items = [];
    meals = [meal];
    renderMealChips();
    await generateMeal(meal);
  } catch (error) {
    console.error(error);
    setStatus(`Error: ${error.message}`);
  } finally {
    generateBtn.disabled = false;
  }
});

addMealBtn.addEventListener("click", async () => {
  const meal = mealInput.value.trim();

  if (!meal) {
    setStatus("Enter a meal name first.");
    return;
  }

  addMealBtn.disabled = true;

  try {
    meals.push(meal);
    renderMealChips();
    await generateMeal(meal);
  } catch (error) {
    console.error(error);
    setStatus(`Error: ${error.message}`);
  } finally {
    addMealBtn.disabled = false;
  }
});

copyBtn.addEventListener("click", async () => {
  const lines = items.map((item) => {
    const parts = [capitalise(item.name)];
    if (item.amount) parts.push(`- ${item.amount}`);
    if (item.notes) parts.push(`(${item.notes})`);
    return parts.join(" ");
  });

  if (!lines.length) {
    setStatus("Nothing to copy yet.");
    return;
  }

  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    setStatus("Shopping list copied.");
  } catch (error) {
    setStatus("Copy failed.");
  }
});

clearBtn.addEventListener("click", () => {
  mealInput.value = "";
  meals = [];
  items = [];
  renderMealChips();
  render();
  setStatus("");
  mealInput.focus();
});

mealInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    generateBtn.click();
  }
});

render();
