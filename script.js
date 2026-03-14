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

    const grid = document.createElement("div");
    grid.className = "items-grid";

    grouped[category].forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "item-card";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "item-checkbox";
      checkbox.id = `${category}-${index}-${item.name}`;

      const content = document.createElement("div");
      content.className = "item-content";

      const top = document.createElement("div");
      top.className = "item-top";

      const name = document.createElement("h4");
      name.className = "item-name";
      name.textContent = capitalise(item.name);

      top.appendChild(name);

      if (item.amount) {
        const amount = document.createElement("span");
        amount.className = "amount-pill";
        amount.textContent = item.amount;
        top.appendChild(amount);
      }

      content.appendChild(top);

      if (item.notes) {
        const notes = document.createElement("div");
        notes.className = "item-notes";
        notes.textContent = item.notes;
        content.appendChild(notes);
      }

      card.appendChild(checkbox);
      card.appendChild(content);
      grid.appendChild(card);
    });

    block.appendChild(grid);
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

render();const mealInput=document.getElementById("mealInput")
const servingsInput=document.getElementById("servings")
const generateBtn=document.getElementById("generateBtn")
const addMealBtn=document.getElementById("addMealBtn")
const shoppingList=document.getElementById("shoppingList")
const mealList=document.getElementById("mealList")
const copyBtn=document.getElementById("copyBtn")
const clearBtn=document.getElementById("clearBtn")
const statusEl=document.getElementById("status")

let meals=[]
let items=[]

function setStatus(text){
statusEl.textContent=text
}

function capitalise(text){
return text.charAt(0).toUpperCase()+text.slice(1)
}

async function generate(meal){

setStatus("Generating...")

const res=await fetch("/api/generate",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
mealName:meal,
servings:servingsInput.value
})
})

const data=await res.json()

if(!res.ok) throw new Error(data.error)

items=[...items,...data.items]

render()

setStatus("Done")
}

function render(){

const grouped={}

items.forEach(item=>{

const cat=item.category||"Other"

if(!grouped[cat]) grouped[cat]=[]

grouped[cat].push(item)

})

shoppingList.innerHTML=""

Object.keys(grouped).forEach(cat=>{

const section=document.createElement("div")
section.className="category"

const title=document.createElement("div")
title.className="categoryTitle"
title.textContent=cat

section.appendChild(title)

grouped[cat].forEach((item,i)=>{

const card=document.createElement("div")
card.className="card"

const top=document.createElement("div")
top.className="cardTop"

const cb=document.createElement("input")
cb.type="checkbox"

const name=document.createElement("div")
name.className="itemName"
name.textContent=capitalise(item.name)

top.appendChild(cb)
top.appendChild(name)

card.appendChild(top)

if(item.amount){

const meta=document.createElement("div")
meta.className="meta"
meta.textContent=`Amount: ${item.amount}`

card.appendChild(meta)

}

if(item.notes){

const meta=document.createElement("div")
meta.className="meta"
meta.textContent=`Notes: ${item.notes}`

card.appendChild(meta)

}

section.appendChild(card)

})

shoppingList.appendChild(section)

})

}

generateBtn.onclick=()=>{

const meal=mealInput.value.trim()

if(!meal) return

generate(meal)

}

addMealBtn.onclick=()=>{

const meal=mealInput.value.trim()

if(!meal) return

meals.push(meal)

const tag=document.createElement("div")
tag.textContent="🍽 "+meal

mealList.appendChild(tag)

generate(meal)

}

clearBtn.onclick=()=>{

items=[]
meals=[]
shoppingList.innerHTML=""
mealList.innerHTML=""
setStatus("")

}

copyBtn.onclick=()=>{

const list=[...document.querySelectorAll(".itemName")]

.map(el=>el.textContent)

navigator.clipboard.writeText(list.join("\n"))

setStatus("Copied")

}
