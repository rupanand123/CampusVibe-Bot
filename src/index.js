console.log("[1/4] Loading environment and dependencies...");
require('dotenv').config();
const { Telegraf } = require('telegraf');
const { checkCrisis } = require('./crisis');
const { getHistory, addMessage, clearHistory } = require('./session');
const { getWellnessResponse } = require('./gemini');

console.log("[2/4] Verifying API tokens...");
// Ensure environment variables are loaded
if (!process.env.TELEGRAM_TOKEN) {
  console.error("CRITICAL ERROR: TELEGRAM_TOKEN is not defined in environment variables.");
  process.exit(1);
}

console.log("[3/4] Initializing Telegraf bot client...");
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Greet user on /start command
bot.start((ctx) => {
  console.log(`[Command] /start from user: ${ctx.from.first_name} (@${ctx.from.username || 'N/A'})`);
  const chatId = ctx.chat.id;
  clearHistory(chatId); // Reset history to start fresh

  const firstName = ctx.from.first_name || 'there';
  const startMessage = `Hi ${firstName}! I'm *Manas*, your supportive mental wellness companion. 🌸

I'm here as a friendly first line of support, an active listener, and a guide toward healthy coping. 

*Please note:* I am an AI bot, not a licensed therapist, counselor, or doctor. I cannot diagnose conditions or prescribe treatments, but I am always here to support you.

We can talk about:
• Academic stress, burnout, or procrastination
• Loneliness, relationships, or family pressure
• Improving sleep, focus, or motivation
• Grounding techniques and mindfulness tips

How are you feeling in this exact moment? What's on your mind?`;

  ctx.replyWithMarkdown(startMessage).catch(err => {
    console.error("Error sending start message:", err);
  });
});

// Provide guide on /help command
bot.help((ctx) => {
  console.log(`[Command] /help from user: ${ctx.from.first_name} (@${ctx.from.username || 'N/A'})`);
  const helpMessage = `I'm here to support you through student life challenges!

*What we can explore:*
• *Grounding exercises:* Simple breathing or focus tasks.
• *Study-Life Balance:* Procrastination and motivation tips.
• *Listening Ear:* Share your feelings on stress, relationships, or loneliness.

*Important Boundaries:*
• I am an AI companion, not a human professional or counselor.
• I do not diagnose mental health conditions or suggest medications/treatments.
• To start our chat fresh and clear my memory, type /start.

If you ever feel overwhelmed or in danger, please tell me, or contact professional emergency lines immediately. How can I help you today?`;

  ctx.replyWithMarkdown(helpMessage).catch(err => {
    console.error("Error sending help message:", err);
  });
});

// Handle incoming text messages
bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const userText = ctx.message.text;
  console.log(`[Message] From: ${ctx.from.first_name} (@${ctx.from.username || 'N/A'}): "${userText}"`);

  // 1. Send typing action to show bot is working
  try {
    await ctx.sendChatAction('typing');
  } catch (err) {
    console.warn("Could not send typing action:", err.message);
  }

  // 2. Crisis Safety Protocol Check
  const crisisCheck = checkCrisis(userText);
  if (crisisCheck.isCrisis) {
    console.log(`[Crisis Intercept] Triggered for user: ${ctx.from.first_name} (@${ctx.from.username || 'N/A'})`);
    // Record user message and the safety response in session history so context is kept
    addMessage(chatId, 'user', userText);
    addMessage(chatId, 'model', crisisCheck.response);
    
    return ctx.replyWithMarkdown(crisisCheck.response).catch(err => {
      console.error("Error sending crisis response:", err);
    });
  }

  // 3. Regular AI Conversation flow
  try {
    const history = getHistory(chatId);
    
    // Call Gemini API with conversation history
    const replyText = await getWellnessResponse(history, userText);
    console.log(`[Reply] To: ${ctx.from.first_name}: "${replyText.replace(/\n/g, ' ')}"`);
    
    // Add turn to history
    addMessage(chatId, 'user', userText);
    addMessage(chatId, 'model', replyText);

    // Send response back to the user
    await ctx.reply(replyText);
  } catch (error) {
    console.error("Error processing wellness chat:", error);
    
    // Send a warm, supportive error message rather than a standard system crash message
    const friendlyErrorMessage = "I'm having a little trouble connecting to my thoughts right now, but I'm still here. Could you try saying that again? I'm listening.";
    ctx.reply(friendlyErrorMessage).catch(err => {
      console.error("Error sending error message:", err);
    });
  }
});

console.log("[4/4] Launching Telegraf bot client (starting long polling)...");
// Start a dummy HTTP server for Render deployment health check
const http = require('http');
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Manas Bot is running and healthy!\n');
});
server.listen(PORT, () => {
  console.log(`Dummy HTTP server listening on port ${PORT}`);
});

// Launch Telegraf Bot
bot.launch()
  .catch((err) => {
    console.error("Failed to start Telegram Bot:", err);
    process.exit(1);
  });
console.log("Manas Bot successfully started and listening for messages on Telegram!");

// Enable graceful stop
process.once('SIGINT', () => {
  bot.stop('SIGINT');
  server.close();
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  server.close();
});
