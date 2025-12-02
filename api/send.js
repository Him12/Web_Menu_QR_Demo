export default async function handler(req, res) {
  try {
    // CORS Headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Parse JSON body manually (req.body is a string on Vercel)
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const googleUrl = "https://script.google.com/macros/s/AKfycbyB4SqfUzLzK3NN8uS-ogVxHpkJvXN2yGQ4q3OvScxozDVkxa2N--nf6L9I6O01RvaJ_w/exec";

    // Forward data to Google Apps Script
    const googleResponse = await fetch(googleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await googleResponse.text();

    return res.status(200).send(result);

  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ error: "Server crashed", details: err.message });
  }
}
