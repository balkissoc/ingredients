const mealInput = document.getElementById("meal")
const servingsInput = document.getElementById("servings")
const results = document.getElementById("results")
const status = document.getElementById("status")

let items = []

function render(){

results.innerHTML=""

const grouped={}

items.forEach(i=>{
if(!grouped[i.category]) grouped[i.category]=[]
grouped[i.category].push(i)
})

Object.keys(grouped).forEach(category=>{

const title=document.createElement("div")
title.className="category"
title.textContent=category
results.appendChild(title)

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

const tbody=table.querySelector("tbody")

grouped[category].forEach(item=>{

const tr=document.createElement("tr")

tr.innerHTML=`
<td><input type="checkbox"></td>
<td><strong>${item.name}</strong></td>
<td class="amount">${item.amount||""}</td>
<td class="notes">${item.notes||""}</td>
`

tbody.appendChild(tr)

})

results.appendChild(table)

})

}

async function generate(){

const meal=mealInput.value.trim()
const servings=servingsInput.value

if(!meal){
status.textContent="Enter a meal."
return
}

status.textContent="Generating..."

const r=await fetch("/api/generate",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({mealName:meal,servings})
})

const data=await r.json()

items=data.items

render()

status.textContent="Done."

}

document.getElementById("generate").onclick=generate

document.getElementById("clear").onclick=()=>{
items=[]
results.innerHTML=""
status.textContent=""
}

document.getElementById("copy").onclick=()=>{

const text=items.map(i=>`${i.name} ${i.amount||""} ${i.notes||""}`).join("\n")

navigator.clipboard.writeText(text)

status.textContent="Copied."

}
