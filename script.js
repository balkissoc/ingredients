const mealInput=document.getElementById("mealInput")
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
