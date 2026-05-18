# TruthSphere - Fact News Checker

## Setup & Run Locally

1. Install dependencies:
   ```
   npm install
   ```

2. Get a FREE NewsData.io API key:
   - Go to https://newsdata.io/register
   - Sign up for free (no credit card)
   - Copy your API key from the dashboard (starts with `pub_`)

3. Open `.env` and replace the placeholder with your key:
   ```
   NEWS_API_KEY=pub_your_actual_key_here
   ```

4. Start the server:
   ```
   npm start
   ```

5. Open http://localhost:5000

## Deploy to Render (Free)

1. Push this project to a GitHub repo
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Set:
   - Build Command: `npm install`
   - Start Command: `node backend/server.js`
5. Add environment variables from your `.env` in Render's dashboard
6. Deploy — you get a public URL automatically

## Features
- Signup / Login with JWT auth
- Dashboard with auth guard + logout
- Live news search powered by NewsData.io
- Category filters: All, Politics, Technology, Health, Sports, Science
- News cards with images, source badge, and Read Article link
- Works in localhost dev AND public deployment
