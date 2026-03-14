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

function setStatus(text){
  statusEl.textContent = text;
}

function capitalise(text){
  if(!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function normaliseUnits(item){

  let amount = item.amount?.trim() || "";

  if(!amount) return item;

  if(/^\d+$/.test(amount)){

    const name = item.name.toLowerCase();

    if(
      name.includes("beef") ||
      name.includes("chicken") ||
      name.includes("pork") ||
      name.includes("broccoli") ||
      name.includes("carrot") ||
      name.includes("ginger")
    ){
      amount = amount + " g";
    }

    if(
      name.includes("oil") ||
      name.includes("soy sauce") ||
      name.includes("vinegar")
    ){
      amount = amount + " ml";
    }

  }

  return {...item, amount};
}

function mergeIngredients(list){

  const merged = {};

  list.forEach(item=>{

    const key = item.name.toLowerCase();

    if(!merged[key]){
      merged[key] = {...item};
      return;
    }

    const existing = merged[key];

    const num1 = parseFloat(existing.amount);
    const num2 = parseFloat(item.amount);

    const unit1 = existing.amount.replace(num1,"").trim();
    const unit2 = item.amount.replace(num2,"").trim();

    if(!isNaN(num1) && !isNaN(num2) && unit1 === unit2){
      existing.amount = (num1 + num2) + " " + unit1;
    }

  });

  return Object.values(merged);
}

function renderMealChips(){

  mealChips.innerHTML="";

  meals.forEach(meal=>{
    const chip=document.createElement("div");
    chip.className="meal-chip";
    chip.textContent="🍽 " + meal;
    mealChips.appendChild(chip);
  });

}

function render(){

  shoppingList.innerHTML="";

  if(!items.length){
    shoppingList.innerHTML = `<div class="empty-state">Your shopping list is empty</div>`;
    return;
  }

  const grouped = {};

  items.forEach(item=>{
    const cat = item.category || "Other";
    if(!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const order = ["Produce","Meat","Dairy","Pantry","Condiments","Other"];

  order.forEach(category=>{

    if(!grouped[category]) return;

    const block = document.createElement("section");
    block.className = "category-block";

    const header = document.createElement("div");
    header.className = "category-header";

    const title = document.createElement("h3");
    title.className = "category-title";
    title.textContent = category;

    header.appendChild(title);
    block.appendChild(header);

    const tableWrap = document.createElement("div");
    tableWrap.className="table-wrap";

    const table = document.createElement("table");
    table.className="shopping-table";

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

    grouped[category].forEach(item=>{

      const row=document.createElement("tr");

      row.innerHTML=`
        <td class="col-check"><input type="checkbox" class="item-checkbox"></td>
        <td class="ingredient-name">${capitalise(item.name)}</td>
        <td class="amount-cell">${item.amount || "—"}</td>
        <td class="notes-cell">${item.notes || "—"}</td>
      `;

      tbody.appendChild(row);

    });

    tableWrap.appendChild(table);
    block.appendChild(tableWrap);
    shoppingList.appendChild(block);

  });

}

async function generateMeal(meal){

  setStatus("Generating shopping list...");

  const response = await fetch("/api/generate",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      mealName:meal,
      servings:Number(servingsInput.value)
    })
  });

  const data = await response.json();

  if(!response.ok){
    setStatus(data.error || "Error generating list");
    return;
  }

  const newItems = data.items.map(normaliseUnits);

  items = mergeIngredients([...items,...newItems]);

  render();

  setStatus("Done. Generated " + newItems.length + " ingredients.");

}

generateBtn.onclick = async()=>{

  const meal = mealInput.value.trim();

  if(!meal){
    setStatus("Enter a meal name.");
    return;
  }

  items=[];
  meals=[meal];

  renderMealChips();

  await generateMeal(meal);

};

addMealBtn.onclick = async()=>{

  const meal = mealInput.value.trim();

  if(!meal){
    setStatus("Enter a meal name.");
    return;
  }

  meals.push(meal);

  renderMealChips();

  await generateMeal(meal);

};

copyBtn.onclick = async()=>{

  const lines = items.map(i=>{
    let line = capitalise(i.name);
    if(i.amount) line += " - " + i.amount;
    if(i.notes) line += " (" + i.notes + ")";
    return line;
  });

  await navigator.clipboard.writeText(lines.join("\n"));

  setStatus("Shopping list copied.");

};

clearBtn.onclick = ()=>{

  meals=[];
  items=[];

  mealInput.value="";

  renderMealChips();
  render();

  setStatus("");

};

render();
