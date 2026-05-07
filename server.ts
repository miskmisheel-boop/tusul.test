import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenerativeAI } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get AI Client
const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const getGemini = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

// API: AI Analysis & CV Improvement
app.post("/api/analyze-cv", async (req, res) => {
  const { cvContent, personInfo, jobGoal, language } = req.body;
  
  const systemPrompt = language === 'mn' 
    ? "Та бол мэргэжлийн карьерын зөвлөх. CV-г шинжилж, сайжруулах зөвлөмжүүдийг жагсааж гарга. Хариултыг Монгол хэлээр өг."
    : "You are a professional career coach. Analyze the CV and provide a list of improvements. Answer in English.";

  const userPrompt = `
    Job Goal: ${jobGoal}
    Current CV Content: ${cvContent}
    Personal Info: ${JSON.stringify(personInfo)}
    
    Provide:
    1. Overall score (0-100)
    2. List of specific improvements
    3. Suggested keywords to add
    4. Enhanced summary section
  `;

  try {
    // Try Gemini first as it's provided in the environment
    const genAI = getGemini();
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([systemPrompt, userPrompt]);
      return res.json({ text: result.response.text() });
    }

    // Fallback to OpenAI if configured
    const openai = getOpenAI();
    if (openai) {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      });
      return res.json({ text: response.choices[0].message.content });
    }

    res.status(500).json({ error: "No AI API keys configured" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Career Recommendation
app.post("/api/career-recommendation", async (req, res) => {
  const { skills, interests, education, language } = req.body;

  const systemPrompt = language === 'mn'
    ? "Та бол карьер төлөвлөгч. Хэрэглэгчийн чадвар, сонирхол дээр тулгуурлан хамгийн тохиромжтой 3 ажил болон сурах ёстой чадваруудыг санал болго."
    : "You are a career planner. Based on skills and interests, recommend 3 suitable jobs and skills to learn.";

  const userPrompt = `
    Skills: ${skills.join(", ")}
    Interests: ${interests.join(", ")}
    Education: ${JSON.stringify(education)}
  `;

  try {
    const genAI = getGemini();
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([systemPrompt, userPrompt]);
      return res.json({ text: result.response.text() });
    }
    res.status(500).json({ error: "No AI API keys configured" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
