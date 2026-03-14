export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { mealName } = req.body || {};

    if (!mealName || !mealName.trim()) {
      return res.status(400).json({ error: "Meal name is required." });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured." });
    }

    const prompt = `
You generate a typical shopping list for a named meal.

Meal name:
${mealName}

Return ONLY valid JSON in this exact format:
{
  "items": [
    {
      "name": "string",
      "amount": "string",
      "notes": "string"
    }
  ]
}

Rules:
- Return a practical, typical ingredient list for the named meal.
- Include common ingredients only.
- Include quantities in metric where practical.
- Keep "name" short and shopping-list friendly.
- Put preparation or substitution notes in "notes".
- Do not include method steps.
- Do not include headings.
- Do not include markdown.
- If unsure, choose the most common mainstream version of the meal.
- If the meal is very broad, provide a sensible base recipe.
- Amount and notes can be empty strings if necessary.
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        input: prompt
      })
    });

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
      console.error("JSON parse error:", error, text);
      return res.status(500).json({ error: "Model returned invalid JSON." });
    }

    if (!parsed.items || !Array.isArray(parsed.items)) {
      return res.status(500).json({ error: "Model returned unexpected data." });
    }

    const cleanedItems = parsed.items
      .filter((item) => item && item.name)
      .map((item) => ({
        name: String(item.name).trim(),
        amount: String(item.amount || "").trim(),
        notes: String(item.notes || "").trim()
      }));

    return res.status(200).json({ items: cleanedItems });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
