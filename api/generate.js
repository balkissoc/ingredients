export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { mealName, servings = 4 } = req.body || {};

    if (!mealName || !mealName.trim()) {
      return res.status(400).json({ error: "Meal name is required." });
    }

    const safeServings = Math.max(1, Math.min(12, Number(servings) || 4));

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured." });
    }

    const prompt = `
You generate a practical shopping list for a meal.

Meal: ${mealName}
Servings: ${safeServings}

Return ONLY valid JSON in this exact format:

{
  "items":[
    {
      "name":"ingredient",
      "amount":"quantity",
      "notes":"optional detail",
      "category":"Produce | Meat | Dairy | Pantry | Condiments | Other"
    }
  ]
}

Rules:
- No markdown
- No headings
- No explanation
- Ingredient name must contain ONLY the ingredient
- Amount contains only quantity
- Notes contains preparation or substitutions
- Use metric quantities where possible
- Quantities must match the requested servings
- Categories must be one of: Produce, Meat, Dairy, Pantry, Condiments, Other
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        input: prompt,
        text: {
          format: {
            type: "json_object"
          }
        }
      })
    });

    clearTimeout(timeout);

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({
        error: data?.error?.message || "OpenAI request failed."
      });
    }

    let text =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "";

    if (!text) {
      console.error("No usable model output:", data);
      return res.status(500).json({ error: "No model output returned." });
    }

    text = text.trim();

    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    }

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (error) {
      console.error("JSON parse error:", text);
      return res.status(500).json({ error: "Model returned invalid JSON." });
    }

    if (!Array.isArray(parsed.items)) {
      return res.status(500).json({ error: "Model returned unexpected data." });
    }

    const allowedCategories = [
      "Produce",
      "Meat",
      "Dairy",
      "Pantry",
      "Condiments",
      "Other"
    ];

    const cleanedItems = parsed.items
      .filter((i) => i && i.name)
      .map((i) => ({
        name: String(i.name || "").trim(),
        amount: String(i.amount || "").trim(),
        notes: String(i.notes || "").trim(),
        category: allowedCategories.includes(i.category)
          ? i.category
          : "Other"
      }))
      .filter((i) => i.name.length > 0);

    if (!cleanedItems.length) {
      return res.status(500).json({ error: "No ingredients generated." });
    }

    return res.status(200).json({ items: cleanedItems });

  } catch (error) {
    console.error("Server error:", error);

    if (error.name === "AbortError") {
      return res.status(500).json({ error: "OpenAI request timed out." });
    }

    return res.status(500).json({ error: "Internal server error." });
  }
}
