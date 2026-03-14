const mealInput=document.getElementById("mealInput")
const servingsInput=document.getElementById("servings")
const generateBtn=document.getElementById("generateBtn")
const addMealBtn=document.getElementById("addMealBtn")
const shoppingList=document.getElementById("shoppingList")
const mealChips=document.getElementById("mealChips")
const copyBtn=document.getElementById("copyBtn")
const clearBtn=document.getElementById("clearBtn")
const statusEl=document.getElementById("status")

let meals=[]
let items=[]

function setStatus(text){
statusEl.textContent=text
}

function cap(text){
return text.charAt(0).toUpperCase()+text.slice(1)
}

function renderChips(){
mealChips.innerHTML=""
meals.forEach(m=>{
const chip=document.createElement("div")
chip.className="meal-chip"
chip.textContent="🍽 "+m
mealChips.appendChild(chip)
})
}

function render(){

shoppingList.innerHTML=""

if(!items.length){
shoppingList.innerHTML='<div class="empty">🛒 Your shopping list is empty</div>'
return
}

const grouped={}

items.forEach(i=>{
const cat=i.category||"Other"
if(!grouped[cat])grouped[cat]=[]
grouped[cat].push(i)
})

Object.keys(grouped).forEach(cat=>{

const title=document.createElement("div")
title.className="category"
title.textContent=cat
shoppingList.appendChild(title)

const table=document.createElement("table")

table.innerHTML=`
<thead>
<tr>
<th></th>
<th>Ingredient</th>
<th>Amount</th>
<th>Notes</th>
</tr>
</thead>
<tbody></tbody>
`

const body=table.querySelector("tbody")

grouped[cat].forEach(item=>{

const row=document.createElement("tr")

row.innerHTML=`
<td><input type="checkbox"></td>
<td><strong>${cap(item.name)}</strong></td>
<td>${item.amount?`<span class="amount-pill">${item.amount}</span>`:"—"}</td>
<td class="notes">${item.notes||"—"}</td>
`

body.appendChild(row)

})

shoppingList.appendChild(table)

})
}

async function generateMeal(meal){

setStatus("Generating shopping list...")

const res=await fetch("/api/generate",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
mealName:meal,
servings:Number(servingsInput.value)
})
})

const data=await res.json()

items=[...items,...data.items]

render()

setStatus(`Done. Generated ${data.items.length} ingredients.`)

}

generateBtn.onclick=async()=>{

const meal=mealInput.value.trim()

if(!meal){
setStatus("Enter a meal first")
return
}

generateBtn.disabled=true

try{
items=[]
meals=[meal]
renderChips()
await generateMeal(meal)
}
catch(e){
setStatus("Error generating list")
}

generateBtn.disabled=false

}

addMealBtn.onclick=async()=>{

const meal=mealInput.value.trim()

if(!meal)return

addMealBtn.disabled=true

meals.push(meal)
renderChips()

await generateMeal(meal)

addMealBtn.disabled=false

}

copyBtn.onclick=async()=>{

if(!items.length){
setStatus("Nothing to copy")
return
}

const text=items.map(i=>`${i.name} ${i.amount||""} ${i.notes||""}`).join("\n")

await navigator.clipboard.writeText(text)

setStatus("Copied shopping list")

}

clearBtn.onclick=()=>{

mealInput.value=""
meals=[]
items=[]
renderChips()
render()
setStatus("")

}

render()
