const { env } = require("../../config/env");
const AppError = require("../../utils/appError");
const { normalizeAnalysisResponse } = require("../../utils/analysisSchema");

const providerName = "openai";

function buildPrompt(payload) {
  const responseLanguage = payload.language === "mn" ? "Mongolian" : "English";

  return [
    "You are a senior AI career advisor.",
    "Analyze the candidate CV and respond with valid JSON only.",
    `Write all explanatory text values in ${responseLanguage}.`,
    "Keep keys in English exactly as requested.",
    "Return this exact shape:",
    "{",
    '  "candidateName": string,',
    '  "targetRole": string,',
    '  "skills": string[],',
    '  "experienceLevel": string,',
    '  "weakPoints": string[],',
    '  "careerRecommendations": string[],',
    '  "cvImprovementSuggestions": string[],',
    '  "rewrittenCv": string,',
    '  "summary": string',
    "}",
    "",
    `Candidate name: ${payload.fullName}`,
    `Target role: ${payload.targetRole}`,
    `Reported years of experience: ${payload.experienceYears}`,
    `Career goals: ${payload.careerGoals || "Not provided"}`,
    "CV text:",
    payload.cvText
  ].join("\n");
}

async function requestOpenAi(prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.openAiTimeoutMs);
  let response;

  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.openAiApiKey}`
      },
      body: JSON.stringify({
        model: env.openAiModel,
        input: prompt
      }),
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new AppError("OpenAI request timed out.", 504, "OPENAI_TIMEOUT");
    }

    throw new AppError("OpenAI request failed before completion.", 502, "OPENAI_NETWORK_ERROR");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError(`OpenAI request failed: ${errorText}`, 502, "OPENAI_BAD_RESPONSE");
  }

  const data = await response.json();
  if (data.output_text) {
    return data.output_text;
  }

  const textFromContent = (data.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text" && item.text)
    .map((item) => item.text)
    .join("\n");

  if (!textFromContent) {
    throw new AppError("OpenAI response did not include text output.", 502, "OPENAI_EMPTY_RESPONSE");
  }

  return textFromContent;
}

function safeParseJson(text) {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new AppError("OpenAI response did not contain JSON.", 502, "OPENAI_JSON_MISSING");
  }

  try {
    return JSON.parse(text.slice(firstBrace, lastBrace + 1));
  } catch {
    throw new AppError("OpenAI returned invalid JSON.", 502, "OPENAI_JSON_INVALID");
  }
}

async function analyzeCareerProfile(payload) {
  const responseText = await requestOpenAi(buildPrompt(payload));
  return normalizeAnalysisResponse(safeParseJson(responseText));
}

async function rewriteCv(payload) {
  const analysis = await analyzeCareerProfile(payload);
  return analysis.rewrittenCv;
}

module.exports = {
  providerName,
  analyzeCareerProfile,
  rewriteCv
};
