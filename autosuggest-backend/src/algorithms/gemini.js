const { GoogleGenerativeAI } = require('@google/generative-ai');

function build(phrases) {
  const samples = phrases.slice(0, 5).map(p => p.text);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is required');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  async function search(prefix, limit) {
    const prompt = `Given the prefix "${prefix}", generate ${limit} short realistic autocomplete completions in the style of software/tech job-role phrases. Examples:
${samples.map(s => `- ${s}`).join('\n')}

Return ONLY a JSON array of objects with keys "text" (string, the full completion) and "weight" (integer 1-100). Do not wrap in markdown code fences.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/^```(?:json)?\s*|\s*```$/gi, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`Failed to parse Gemini response as JSON: ${text}`);
    }

    if (!Array.isArray(parsed)) {
      throw new Error(`Gemini response is not an array: ${JSON.stringify(parsed)}`);
    }

    for (const item of parsed) {
      if (typeof item.text !== 'string' || typeof item.weight !== 'number') {
        throw new Error(`Gemini response item missing "text" (string) or "weight" (number): ${JSON.stringify(item)}`);
      }
    }

    return parsed.slice(0, limit);
  }

  return { search };
}

module.exports = { build };
