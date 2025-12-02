export default async function handler(req, res) {
  try {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Read JSON body
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { email, mobile } = body;

    if (!email && !mobile) {
      return res.status(400).json({ error: "Email or mobile required" });
    }

    // 👉 Your NEW Google Script URL that RETURNS JSON
    const googleUrl =
      "https://script.google.com/macros/s/AKfycbyuq2b339jj20ZIB8TgIn7H4-pfsklUFllAyiSp-5qBRO0HfEln74c4R4vU8pkiOYU4MQ/exec"; // (we'll create this next)

    // Fetch entire sheet data as JSON
    const response = await fetch(googleUrl);
    const sheetData = await response.json(); // GAS must return array of rows

    // Find matching customer
    const match = sheetData.filter(
      (row) => row.email === email || row.mobile === mobile
    );

    if (match.length === 0) {
      return res.json({
        found: false,
        visits: 0,
      });
    }

    return res.json({
      found: true,
      name: match[0].name,
      visits: match.length,
    });

  } catch (err) {
    console.error("CHECK-CUSTOMER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
