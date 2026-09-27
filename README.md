# TruthSphere - AI-Assisted News & Claim Verification

## Setup & Run Locally

1. Install dependencies:
   ```
   npm install
   ```

2. Get a FREE NewsData.io API key (used for news browsing AND as the evidence source for claim verification):
   - Go to https://newsdata.io/register
   - Sign up for free (no credit card)
   - Copy your API key from the dashboard (starts with `pub_`)

3. Get a FREE Groq API key (used to run the AI reasoning step for claim verification):
   - Go to https://console.groq.com/keys
   - Create a key (starts with `gsk_`)

4. Copy `.env.example` to `.env` and fill in both keys:
   ```
   NEWS_API_KEY=pub_your_actual_key_here
   GROQ_API_KEY=gsk_your_actual_key_here
   ```

5. Start the server:
   ```
   npm start
   ```

6. Open http://localhost:5000

## Deploy to Render (Free)

1. Push this project to a GitHub repo
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Set:
   - Build Command: `npm install`
   - Start Command: `node backend/server.js`
5. Add environment variables (`NEWS_API_KEY`, `GROQ_API_KEY`, `MONGO_URI`, `JWT_SECRET`) from your `.env` in Render's dashboard
6. Deploy — you get a public URL automatically

## Features
- Signup / Login with JWT auth
- Real dashboard: every card (Claims Verified, Votes Cast, Reputation) and the Recent Activity feed reflect actual database records for the logged-in user — nothing hardcoded. Voting on an article and verifying a claim both persist to MongoDB and update these numbers immediately.
- Live news search & browsing powered by NewsData.io, with category filters
- **AI-assisted claim verification**: paste a headline or claim, and the app:
  1. Retrieves related, recent news articles as evidence (via NewsData.io)
  2. Sends the claim + that evidence to an LLM (Groq/Llama 3.3), which is instructed to judge the claim *only* against the retrieved evidence
  3. Returns a verdict (Supported / Contradicted / Mixed / Unverified), a confidence level, a short explanation citing the evidence, and links to the actual source articles

## Honest limitations
This is retrieval-grounded AI reasoning, not a certified fact-checking authority. It can only judge a claim against whatever news coverage exists and gets retrieved — if there's no coverage, or the coverage is thin, the verdict will (and should) come back "Unverified." Always check the linked sources yourself before treating a verdict as final.
