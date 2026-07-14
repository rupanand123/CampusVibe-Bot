# Manas - Telegram Mental Wellness Bot 

**Manas** is a supportive, warm, and non-judgmental mental wellness companion for students on Telegram. Built using Node.js, `Telegraf`, and Google's `gemini-3.5-flash` model, Manas provides a friendly first line of support, active listening, healthy coping strategies, and crisis intervention resources.

> ⚠️ **Disclaimer:** Manas is an AI companion and is **NOT** a licensed therapist, doctor, or counselor. It does not diagnose mental health conditions, prescribe medications, or provide clinical treatment plans. It actively guides students in distress toward professional help.

---

## Features

- **Warm & Supportive Tone:** Speaks in simple, everyday language without clinical jargon.
- **Active Listening & Validation:** Empathetically validates the student's feelings before offering any coping tips or exercises.
- **Academic & Life Coping Support:** Helps with academic stress, loneliness, anxiety, sleep issues, focus, motivation, and study-life balance.
- **Crisis Intervention Protocol:** Programmatically scans messages for self-harm or suicidal keywords. It immediately responds with verified helpline details (such as iCall and Vandrevala Foundation in India) and encourages human connection.
- **Contextual Conversations:** Retains active memory of the conversation history (up to the last 20 messages) so conversations flow naturally.
- **Self-Healing Integration:** Features exponential backoff retries to automatically recover from transient Gemini API errors (like 503 Service Unavailable).

---

## Project Structure

```text
CampusVibe/
├── src/
│   ├── crisis.js          # Local regex crisis detection and helpline resources
│   ├── session.js         # Conversation history tracker (in-memory)
│   ├── gemini.js          # Google Gemini SDK setup and system prompts
│   ├── index.js           # Telegram bot entry point and handler orchestrator
│   └── test_bot_logic.js  # Verification and automated testing suite
├── .env                   # Configuration secrets (Telegram & Gemini API keys)
├── .gitignore             # Ignored paths (node_modules, secrets)
├── package.json           # Scripts and package dependencies
└── README.md              # Documentation
```

---

## Installation & Setup

1. **Clone/Ensure files are present in the directory**:
   Verify you are in the project folder containing `package.json`.

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Verify API Credentials in `.env`**:
   The bot uses the environment variables stored in `.env`. Ensure they are configured:
   ```env
   TELEGRAM_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```

---

## Running the Bot

### 🧪 Run Automated Tests
Execute the verification test suite to check crisis filtering and live Gemini API responses:
```bash
npm test
```

### 🚀 Start in Development Mode (With Auto-Reload)
Starts the bot with Node's native hot-reloading feature (Node 24+):
```bash
npm run dev
```

### 📦 Start in Production Mode
```bash
npm start
```

---

## Commands on Telegram

- `/start` - Greets you, resets/clears your conversational history, and introduces the bot.
- `/help` - Explains what the bot can help you with, defines boundaries, and outlines helplines.
- *Any text message* - Chats with Manas.
