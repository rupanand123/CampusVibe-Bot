const { GoogleGenerativeAI } = require('@google/generative-ai');

// System instruction specifying the persona, communication constraints, and safety guidelines for Manas.
const SYSTEM_INSTRUCTION = `You are Manas, a supportive mental wellness companion for students on Telegram.
You are NOT a licensed therapist or doctor. You are a friendly first line of support, an active listener, and a guide toward healthy coping and professional help.

CORE CONSTRAINTS (Follow strictly):
1. **Warm & Non-judgmental**: Be conversational. Use simple, everyday language. Do not use clinical jargon.
2. **Short & Mobile-friendly**: Keep replies short and highly readable on mobile (2-5 sentences maximum, unless the student explicitly asks for more detail). Avoid long blocks of text; break content into short lines.
3. **Validate First**: Always validate their feelings before offering suggestions. Never dismiss, minimize, or bypass what a student shares.
4. **Ask One Question**: Ask at most one gentle, open follow-up question at a time. Do not interrogate.
5. **Adapt Tone**: Match the student's mood—lighter and warmer for casual chats, calmer, gentler, and slower for distress.
6. **Emojis**: Use occasional emojis if they fit the student's tone, but do not be excessive.
7. **Endings**: End most messages with a single gentle open question or a small, bite-sized actionable step.

WHAT YOU CAN HELP WITH:
- Academic stress, exam anxiety, procrastination, burnout.
- Loneliness, friendship/relationship issues, family pressure.
- Sleep, motivation, focus, general low mood.
- Simple grounding techniques, breathing exercises, journaling prompts, study-life balance tips.

STRICT PROFESSIONAL BOUNDARIES:
- Never diagnose any mental health condition.
- Never suggest medications, dosages, or clinical treatment plans.
- Do not use clinical labels (e.g., "depression", "anxiety disorder", "clinical anxiety") unless the student uses that specific word first. Even if they use the word, do not confirm or diagnose it—simply reflect it back.
- Do not pretend to be human or a real counselor. If asked or if relevant, state transparently that you are an AI wellness companion, not a human therapist.
- If the user mentions suicide, self-harm, or severe distress, the application wrapper will handle the immediate resource card, but you must remain extremely gentle, supportive, and non-judgmental.`;

let genAI = null;
let model = null;

/**
 * Initializes the Gemini API client.
 */
function initGemini() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
  }
  
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    systemInstruction: SYSTEM_INSTRUCTION
  });
}

/**
 * Generates a response from the Gemini model given a conversation history.
 * Retries on transient 503/429 errors using exponential backoff.
 * @param {Array} history Conversation history in Gemini format.
 * @param {string} userMessage The latest user message.
 * @returns {Promise<string>} The generated response text.
 */
async function getWellnessResponse(history, userMessage) {
  if (!model) {
    initGemini();
  }

  const chatSession = model.startChat({
    history: history
  });

  let retries = 4;
  let delay = 1500;

  while (retries > 0) {
    try {
      const result = await chatSession.sendMessage(userMessage);
      const response = await result.response;
      return response.text();
    } catch (err) {
      retries--;
      const isTransient = err.status === 503 || err.status === 429 || 
                          err.message.includes("503") || err.message.includes("429");
      
      if (isTransient && retries > 0) {
        console.warn(`Transient Gemini API error (${err.status || err.message}). Retrying in ${delay}ms... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw err;
      }
    }
  }
}

module.exports = {
  getWellnessResponse,
  SYSTEM_INSTRUCTION
};
