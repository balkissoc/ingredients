const mealInput = document.getElementById("mealInput");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const shoppingList = document.getElementById("shoppingList");
const statusEl = document.getElementById("status");

function setStatus(message) {
  statusEl.textContent = message;
}

function renderList(items) {
  shoppingList.innerHTML = "";

  if (!items || items.length === 0) {
    shoppingList.innerHTML = "<li>No ingredients generated.</li>";
    return;
  }

  items.forEach((item, index) => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `item-${index}`;

    const label = document.createElement("label");
    label.htmlFor = `item-${index}`;
    label.textContent = ` ${item.name}`;

    li.appendChild(checkbox);
    li.appendChild(label);

    const parts = [];
    if (item.amount) parts.push(`Amount: ${item.amount}`);
    if (item.notes) parts.push(`Notes: ${item.notes}`);

    if (parts.length > 0) {
      const meta = document.createElement("span");
      meta.className = "item-meta";
      meta.textContent = parts.join(" | ");
      li.appendChild(meta);
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
  const items = [...shoppingList.querySelectorAll("li")].map(li => {
    const label = li.querySelector("label")?.textContent.trim() || "";
    const meta = li.querySelector(".item-meta")?.textContent.trim() || "";
    return meta ? `${label} — ${meta}` : label;
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
