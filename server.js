const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("trust proxy", 1);

// Limit abuse
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  message: "Too many requests, slow down."
});
app.use("/chat", limiter);

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL = process.env.MODEL || "deepseek-ai/DeepSeek-V3";
const HF_URL = "https://router.huggingface.co/v1";

const PORT = process.env.PORT || 10000;

// --------------------
// Ultralight /legacy route for feature phones
// --------------------
app.get("/legacy", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>Mini AI Chat</title></head>
    <body>
      <form method="POST" action="/legacy">
        <textarea name="q" rows="2"></textarea>
        <button type="submit">Send</button>
      </form>
    </body>
    </html>
  `;
  res.send(html);
});

app.post("/legacy", async (req, res) => {
  const question = (req.body.q || "").trim();
  if (!question) return res.redirect("/legacy");

  const payload = {
    model: MODEL,
    messages: [{ role: "user", content: question }],
    max_tokens: 400
  };

  try {
    const r = await fetch(`${HF_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    const answer = data?.choices?.[0]?.message?.content || "No response";

    const safeAnswer = answer.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Mini AI Chat</title></head>
      <body>
        <form method="POST" action="/legacy">
          <textarea name="q" rows="2">${question}</textarea>
          <button type="submit">Send</button>
        </form>
        <div><b>AI:</b> ${safeAnswer}</div>
      </body>
      </html>
    `;
    res.send(html);
  } catch (err) {
    res.send(`<p>Error: ${err.message}</p>`);
  }
});

// --------------------
// Modern /chat route (unchanged)
// --------------------
app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/chat", async (req, res) => {
  const question = (req.body.q || "").trim();
  if (!question)
    return res.sendFile(path.join(__dirname, "public/index.html"));

  const payload = {
    model: MODEL,
    messages: [{ role: "user", content: question }],
    max_tokens: 400
  };

  try {
    const r = await fetch(`${HF_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    const answer = data?.choices?.[0]?.message?.content || "No response";

    const safeAnswer = answer.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mini AI Chat</title>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <form method="POST" action="/chat">
          <textarea name="q" rows="2">${question}</textarea>
          <button type="submit">Send</button>
        </form>
        <div class="reply"><b>AI:</b> ${safeAnswer}</div>
      </body>
      </html>
    `;
    res.send(html);
  } catch (err) {
    res.send(`<p>Error: ${err.message}</p>`);
  }
});

app.listen(PORT, () =>
  console.log(`Mini AI V8 running on port ${PORT}`)
);

