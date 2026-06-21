# Cyril Lopes Portfolio — AI Chat Backend

This is the Node.js/Express server that powers the AI chat agent on your portfolio website.

---

## 📁 File Structure

```
portfolio-backend/
├── server.js          ← Express backend (API proxy)
├── index.html         ← Your portfolio website (updated to use this server)
├── package.json       ← Dependencies
├── .env.example       ← Template for your environment variables
└── README.md          ← This file
```

---

## 🚀 Setup — Step by Step

### Step 1 — Install Node.js (if you don't have it)
Download from: https://nodejs.org (get the LTS version)

Verify it's installed:
```bash
node --version   # should show v18+ or v20+
npm --version
```

### Step 2 — Open this folder in your terminal
```bash
cd path/to/portfolio-backend
```

### Step 3 — Install dependencies
```bash
npm install
```

### Step 4 — Create your .env file
Copy the example file:
```bash
cp .env.example .env
```

Then open `.env` and replace `your_api_key_here` with your real Anthropic API key.

**Get your API key:**
1. Go to https://console.anthropic.com/
2. Sign in (or create a free account)
3. Click "API Keys" in the left sidebar
4. Click "Create Key", give it a name, copy it
5. Paste it into your `.env` file:

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 5 — Start the server
```bash
npm start
```

You should see:
```
✅ Server running at http://localhost:3001
💬 Chat endpoint: POST http://localhost:3001/api/chat
❤️  Health check: GET  http://localhost:3001/api/health
```

### Step 6 — Open your portfolio
Open `index.html` in your browser. The chat agent will now work!

> **Tip:** Use Live Server in VS Code (right-click index.html → "Open with Live Server") for the best experience.

---

## 🔄 Development Mode (auto-restart on file changes)

```bash
npm run dev
```

---

## ✅ Test the backend is running

Open this URL in your browser:
```
http://localhost:3001/api/health
```

You should see:
```json
{ "status": "ok", "message": "Cyril's AI agent is running!" }
```

---

## 🌐 Deploying to Production

When you're ready to put your portfolio live, deploy the backend to one of these free/cheap options:

### Option A — Railway (Recommended, easiest)
1. Push this folder to GitHub
2. Go to https://railway.app
3. New Project → Deploy from GitHub repo
4. Add environment variable: `ANTHROPIC_API_KEY=your_key`
5. Railway gives you a URL like `https://your-app.railway.app`
6. In `index.html`, change:
   ```js
   const CHAT_API_URL = 'https://your-app.railway.app/api/chat';
   ```

### Option B — Render (also free)
1. Push to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo, set start command to `node server.js`
4. Add `ANTHROPIC_API_KEY` in Environment Variables
5. Update `CHAT_API_URL` in `index.html` to your Render URL

### Option C — Vercel (serverless)
Works too, but requires restructuring `server.js` into `/api/chat.js` serverless function format.

---

## 🛡️ Security Notes

- Never commit your `.env` file to GitHub (it's already in `.gitignore`)
- The CORS config in `server.js` only allows requests from your domain — update it when you deploy
- Your Anthropic API key is never exposed to the browser

---

## 📞 Support

Questions? Email: contact@cyrillopes.com
