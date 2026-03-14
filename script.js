const mealInput = document.getElementById("mealInput");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const shoppingList = document.getElementById("shoppingList");
const statusEl = document.getElementById("status");

function setStatus(message) {
  statusEl.textContent = message;
}

function capitalise(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function renderList(items) {
  shoppingList.innerHTML = "";

  if (!items || items.length === 0) {
    shoppingList.innerHTML = "<li>No ingredients generated.</li>";
    return;
  }

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "shopping-item";

    const topRow = document.createElement("div");
    topRow.className = "shopping-item-top";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `item-${index}`;
    checkbox.className = "shopping-checkbox";

    const label = document.createElement("label");
    label.htmlFor = `item-${index}`;
    label.className = "shopping-name";
    label.textContent = capitalise(item.name);

    topRow.appendChild(checkbox);
    topRow.appendChild(label);
    li.appendChild(topRow);

    if (item.amount) {
      const amount = document.createElement("div");
      amount.className = "shopping-meta";
      amount.textContent = `Amount: ${item.amount}`;
      li.appendChild(amount);
    }

    if (item.notes) {
      const notes = document.createElement("div");
      notes.className = "shopping-meta";
      notes.textContent = `Notes: ${item.notes}`;
      li.appendChild(notes);
    }

    shoppingList.appendChild(li);
  });
}

generateBtn.addEventListener("click", async () => {
  const mealName = mealInput.value.trim();

  if (!mealName) {
    setStatus("Enter a meal name first.");
    return;
  }

  generateBtn.disabled = true;
  setStatus("Generating shopping list...");

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mealName })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Generation failed.");
    }

    renderList(data.items);
    setStatus(`Done. Generated ${data.items.length} ingredient${data.items.length === 1 ? "" : "s"}.`);
  } catch (error) {
    console.error(error);
    setStatus(`Error: ${error.message}`);
  } finally {
    generateBtn.disabled = false;
  }
});

copyBtn.addEventListener("click", async () => {
  const items = [...shoppingList.querySelectorAll(".shopping-item")].map((li) => {
    const name = li.querySelector(".shopping-name")?.textContent.trim() || "";
    const meta = [...li.querySelectorAll(".shopping-meta")]
      .map((el) => el.textContent.trim())
      .join(" | ");

    return meta ? `${name} — ${meta}` : name;
  });

  if (items.length === 0) {
    setStatus("Nothing to copy yet.");
    return;
  }

  try {
    await navigator.clipboard.writeText(items.join("\n"));
    setStatus("Shopping list copied.");
  } catch (error) {
    setStatus("Copy failed.");
  }
});

clearBtn.addEventListener("click", () => {
  mealInput.value = "";
  shoppingList.innerHTML = "";
  setStatus("");
  mealInput.focus();
});

mealInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    generateBtn.click();
  }
});
