body {
  font-family: Arial, sans-serif;
  background: #f7f7f7;
  margin: 0;
  padding: 20px;
  color: #1f2937;
}

.container {
  max-width: 820px;
  margin: 0 auto;
  background: white;
  padding: 24px;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

h1, h2 {
  margin-top: 0;
}

.intro {
  margin-bottom: 16px;
  color: #4b5563;
  line-height: 1.5;
}

.meal-input {
  width: 100%;
  padding: 14px 12px;
  font-size: 18px;
  margin-bottom: 16px;
  box-sizing: border-box;
  border: 1px solid #d1d5db;
  border-radius: 10px;
}

.buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

button {
  padding: 10px 16px;
  font-size: 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

button:hover {
  opacity: 0.92;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

#generateBtn {
  background: #2563eb;
  color: white;
}

#copyBtn {
  background: #16a34a;
  color: white;
}

#clearBtn {
  background: #6b7280;
  color: white;
}

.status {
  min-height: 22px;
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 14px;
}

.note {
  margin: 0 0 20px 0;
  font-size: 13px;
  color: #6b7280;
}

#shoppingList {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

#shoppingList li {
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

label {
  cursor: pointer;
  font-weight: 600;
}

.item-meta {
  display: block;
  font-size: 13px;
  color: #6b7280;
  margin-left: 24px;
  margin-top: 4px;
  font-weight: normal;
}

@media (max-width: 600px) {
  .container {
    padding: 18px;
  }

  .meal-input {
    font-size: 16px;
  }

  button {
    width: 100%;
  }
}
