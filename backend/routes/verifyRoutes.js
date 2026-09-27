const express = require("express");
const router = express.Router();
const { searchNews } = require("../services/newsService");
const { optionalAuth } = require("../middleware/auth");
const Activity = require("../models/Activity");
const User = require("../models/User");

// How many retrieved articles to hand to the model as evidence
const MAX_EVIDENCE = 6;

const SYSTEM_PROMPT = `You are a careful fact-checking assistant.

You are given a CLAIM and a numbered list of EVIDENCE excerpts retrieved from recent news sources. Decide whether the evidence supports, contradicts, or is insufficient to judge the claim.

Rules:
- Base your verdict ONLY on the evidence provided. Do not use outside knowledge to assert facts that are not in the evidence.
- If the evidence is unrelated, too thin, or ambiguous, the verdict must be "Unverified" — do not guess.
- "Mixed" means different evidence items disagree with each other.
- Reference evidence by its bracket number (e.g. [1], [3]) in your reasoning.
- Respond with ONLY a raw JSON object — no markdown, no code fences, no text before or after — in exactly this shape:
{
  "verdict": "Supported" | "Contradicted" | "Mixed" | "Unverified",
  "confidence": "low" | "medium" | "high",
  "reasoning": "2-4 sentence explanation citing evidence numbers like [1]",
  "citedIndexes": [1, 3]
}`;

router.post("/", optionalAuth, async (req, res) => {
  try {
    const claim = (req.body?.claim || "").trim();

    if (claim.length < 5) {
      return res.status(400).json({ message: "Please enter a claim or headline to verify." });
    }
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: "AI verification is not configured on this server (missing GROQ_API_KEY)." });
    }

    // 1. Retrieve evidence: reuse the existing news search as our retrieval step
    let allArticles;
    try {
      allArticles = await searchNews({ q: claim });
    } catch (err) {
      return res.status(502).json({ message: "Could not retrieve news evidence for this claim right now." });
    }

    const evidence = allArticles.filter(a => a.title && a.title !== "[Removed]").slice(0, MAX_EVIDENCE);

    if (evidence.length === 0) {
      return res.json({
        verdict: "Unverified",
        confidence: "low",
        reasoning: "No related news coverage was found for this claim, so it could not be checked against any sources.",
        sources: []
      });
    }

    // 2. Build the evidence block the model will reason over
    const evidenceBlock = evidence
      .map((a, i) =>
        `[${i + 1}] Source: ${a.source.name}\nTitle: ${a.title}\nSummary: ${a.description || "N/A"}\nPublished: ${a.publishedAt || "unknown"}`
      )
      .join("\n\n");

    const userPrompt = `CLAIM: "${claim}"\n\nEVIDENCE:\n${evidenceBlock}`;

    // 3. Ask the model to reason over the retrieved evidence (Groq's free tier, OpenAI-compatible API)
    const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const aiData = await aiRes.json();

    if (!aiRes.ok) {
      console.error("Groq API error:", aiData);
      return res.status(502).json({ message: "The AI verification service failed. Please try again." });
    }

    let raw = aiData.choices?.[0]?.message?.content || "{}";
    raw = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("Failed to parse AI response:", raw);
      return res.status(502).json({ message: "The AI returned an unexpected response. Please try again." });
    }

    // 4. Map cited indexes back to real, clickable sources
    const citedIndexes = Array.isArray(parsed.citedIndexes) ? parsed.citedIndexes : [];
    let sources = citedIndexes
      .map(i => evidence[i - 1])
      .filter(Boolean)
      .map(a => ({ title: a.title, url: a.url, source: a.source.name }));

    // Fallback: if the model didn't cite anything usable, surface the top evidence anyway
    if (sources.length === 0) {
      sources = evidence.slice(0, 3).map(a => ({ title: a.title, url: a.url, source: a.source.name }));
    }

    const ALLOWED_VERDICTS = ["Supported", "Contradicted", "Mixed", "Unverified"];
    const verdict = ALLOWED_VERDICTS.includes(parsed.verdict) ? parsed.verdict : "Unverified";
    const ALLOWED_CONFIDENCE = ["low", "medium", "high"];
    const confidence = ALLOWED_CONFIDENCE.includes(parsed.confidence) ? parsed.confidence : "low";

    // If the request came from a logged-in user, record it on their dashboard
    if (req.userId) {
      try {
        await Activity.create({ user: req.userId, type: "verify", title: claim, verdict });
        await User.findByIdAndUpdate(req.userId, { $inc: { reputation: 2 } });
      } catch (logErr) {
        console.error("Failed to log verify activity:", logErr);
        // Don't fail the request just because activity logging failed
      }
    }

    res.json({
      verdict,
      confidence,
      reasoning: parsed.reasoning || "No reasoning was provided.",
      sources
    });

  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ message: "Failed to verify claim." });
  }
});

module.exports = router;
