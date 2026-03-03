const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config({ path: 'c:/Users/Dinesh/OneDrive/Desktop/projects/MCQ genrator/backend/.env' });

async function testGemini() {
    console.log("Testing Gemini API Key...");
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say 'Hello'");
        console.log("Gemini Success:", result.response.text());
    } catch (error) {
        console.error("Gemini Error:", error.message);
    }
}

async function testOpenAI() {
    console.log("\nTesting OpenAI API Key...");
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "Say 'Hello'" }],
        });
        console.log("OpenAI Success:", response.choices[0].message.content);
    } catch (error) {
        console.error("OpenAI Error:", error.message);
    }
}

async function run() {
    await testGemini();
    await testOpenAI();
}

run();
