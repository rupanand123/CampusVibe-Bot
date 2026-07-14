require('dotenv').config();
const { checkCrisis } = require('./crisis');
const { getHistory, addMessage, clearHistory } = require('./session');
const { getWellnessResponse } = require('./gemini');

async function runTests() {
  console.log("=== STARTING MANAS BOT LOGIC TESTS ===");
  let failed = false;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed = true;
    }
  };

  // Test 1: Crisis Detection
  console.log("\nTesting Crisis Detection Module...");
  const crisisCases = [
    { text: "I want to end my life.", expected: true },
    { text: "I feel suicidal today.", expected: true },
    { text: "I might self-harm.", expected: true },
    { text: "I just want to disappear and never wake up.", expected: true },
    { text: "I am having academic stress and anxiety.", expected: false },
    { text: "I feel lonely but I am okay.", expected: false }
  ];

  crisisCases.forEach((tc, idx) => {
    const result = checkCrisis(tc.text);
    assert(result.isCrisis === tc.expected, `Case #${idx + 1} "${tc.text}" -> expected crisis: ${tc.expected}, got: ${result.isCrisis}`);
    if (tc.expected) {
      assert(result.response !== null && result.response.includes("Vandrevala"), `Case #${idx + 1} contains emergency resources`);
    }
  });

  // Test 2: Session Manager Logic
  console.log("\nTesting Session Management...");
  const testChatId = 123456789;
  clearHistory(testChatId);
  assert(getHistory(testChatId).length === 0, "Cleared history has length 0");

  addMessage(testChatId, 'user', "Hello");
  addMessage(testChatId, 'model', "Hi there! How can I help?");
  let hist = getHistory(testChatId);
  assert(hist.length === 2, "History has 2 messages after 1 turn");
  assert(hist[0].role === 'user' && hist[0].parts[0].text === "Hello", "First message is user");
  assert(hist[1].role === 'model' && hist[1].parts[0].text === "Hi there! How can I help?", "Second message is model");

  // Test session capping (capping at 20 messages, starts with 'user')
  clearHistory(testChatId);
  // Add 25 messages, alternating
  for (let i = 1; i <= 25; i++) {
    const role = i % 2 === 1 ? 'user' : 'model';
    addMessage(testChatId, role, `Message ${i}`);
  }
  hist = getHistory(testChatId);
  assert(hist.length <= 20, `Capped history length is ${hist.length} (<= 20)`);
  assert(hist[0].role === 'user', `First message in capped history is 'user' (got ${hist[0].role})`);

  // Test 3: Gemini API Connection & Prompt Style
  console.log("\nTesting Gemini API Integration...");
  try {
    const testPrompt = "I am feeling extremely stressed out by my upcoming exams. I feel like I'm going to fail.";
    console.log(`Sending wellness prompt: "${testPrompt}"`);
    
    const reply = await getWellnessResponse([], testPrompt);
    console.log(`\nGemini Reply:\n------------------\n${reply}\n------------------\n`);
    
    assert(reply && reply.length > 0, "Gemini returned a non-empty response");
    
    // Check constraints (short, warm, validate feelings, end with a question)
    const sentenceCount = reply.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    console.log(`Response sentence count: ${sentenceCount}`);
    assert(sentenceCount >= 1 && sentenceCount <= 6, `Response length (${sentenceCount} sentences) is mobile-friendly (aim 2-5)`);
    
    // Check no clinical jargon/diagnoses
    const hasJargon = /depression|disorder|clinical|diagnos/i.test(reply);
    assert(!hasJargon, "Response does not contain clinical diagnoses or jargon");

  } catch (err) {
    console.error("Failed to query Gemini API:", err);
    failed = true;
  }

  console.log("\n=== TEST RUN COMPLETE ===");
  if (failed) {
    console.error("❌ Some tests failed. Please review the errors above.");
    process.exit(1);
  } else {
    console.log("✅ All logic and API integration tests passed successfully!");
    process.exit(0);
  }
}

runTests();
