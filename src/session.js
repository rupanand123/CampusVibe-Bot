/**
 * Session manager for storing Telegram chat history.
 * Keeps track of previous messages to provide context for the Gemini model.
 */

const MAX_HISTORY_LENGTH = 20; // Maximum number of messages (approx. 10 turns) to keep

// In-memory store: Map<chatId, Array<{ role: 'user'|'model', parts: Array<{ text: string }> }>>
const sessions = new Map();

/**
 * Retrieves the chat history for a specific Telegram chat.
 * @param {number|string} chatId 
 * @returns {Array} List of chat messages in Gemini format.
 */
function getHistory(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, []);
  }
  return sessions.get(chatId);
}

/**
 * Adds a user or model message to the chat history.
 * @param {number|string} chatId 
 * @param {'user'|'model'} role 
 * @param {string} text 
 */
function addMessage(chatId, role, text) {
  const history = getHistory(chatId);
  
  history.push({
    role: role,
    parts: [{ text: text }]
  });

  // Limit history length to avoid memory bloat and keep token count reasonable
  if (history.length > MAX_HISTORY_LENGTH) {
    // Keep the most recent messages, making sure we start with a 'user' message
    // (Gemini API chat history expects alternate user/model turns starting with user)
    let newHistory = history.slice(-MAX_HISTORY_LENGTH);
    while (newHistory.length > 0 && newHistory[0].role !== 'user') {
      newHistory.shift();
    }
    sessions.set(chatId, newHistory);
  }
}

/**
 * Resets the chat history for a specific Telegram chat.
 * @param {number|string} chatId 
 */
function clearHistory(chatId) {
  sessions.set(chatId, []);
}

module.exports = {
  getHistory,
  addMessage,
  clearHistory
};
