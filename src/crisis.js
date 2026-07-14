/**
 * Crisis detection and response handler for Manas.
 * Scans messages for signs of self-harm, suicide, or acute distress,
 * and provides verified helpline resources.
 */

// Regular expressions targeting crisis-related phrases
const CRISIS_PATTERNS = [
  /\b(self[- ]?harm|harming myself|hurt myself|cutting myself|cut myself)\b/i,
  /\b(suicide|suicidal|kill myself|killing myself|end my life|take my own life|taking my own life)\b/i,
  /\b(want to die|wanna die|want to disappear|wishing i was dead|wish i was dead|rather be dead|dont want to live|don't want to live|end it all|commit suicide|hang myself)\b/i,
  /\b(want to sleep and not wake up|wanna sleep and not wake up|wake up dead)\b/i,
  /\b(in danger|being abused|someone is hurting me)\b/i
];

const CRISIS_RESPONSE = `I'm so sorry you're feeling this way, and I want you to know you don't have to carry this alone. Please hear me: your life is valuable, and there is support available for you right now.

Please reach out to one of these free, confidential resources immediately:
📞 *iCall (India)*: 9152987821
📞 *Vandrevala Foundation*: 1860-2662-345 or 1800-2333-330 (Available 24/7)

If you are on campus, please reach out to our campus counselor, a trusted adult, or go to the nearest hospital emergency room.

Please stay connected with a real person right now—whether it's a friend, family member, or one of the numbers above. I'm still right here if you want to keep talking, but please reach out to them first. How are you holding up in this exact moment?`;

/**
 * Checks if the message content matches any crisis patterns.
 * @param {string} text The user's input text.
 * @returns {object} { isCrisis: boolean, response: string|null }
 */
function checkCrisis(text) {
  if (!text || typeof text !== 'string') {
    return { isCrisis: false, response: null };
  }

  const matches = CRISIS_PATTERNS.some(pattern => pattern.test(text));
  return {
    isCrisis: matches,
    response: matches ? CRISIS_RESPONSE : null
  };
}

module.exports = {
  checkCrisis,
  CRISIS_RESPONSE
};
