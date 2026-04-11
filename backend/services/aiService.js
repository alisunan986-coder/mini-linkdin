import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

console.log('[AI Service] Initializing with key starting with:', process.env.GEMINI_API_KEY?.substring(0, 7));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// Force use of Stable V1 API and the widely-supported 'gemini-pro' model
const model = genAI.getGenerativeModel(
  { model: "gemini-pro" }, 
  { apiVersion: 'v1' }
);

/**
 * AI Service - Handles prompts and communication with AI provider
 */
export const improvePost = async (text, mode) => {
  console.log(`[AI Service] Mode: ${mode} | Text Length: ${text.length}`);

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('[AI Service] No valid API key found. Check your .env file.');
    return `[DEMO MODE] Improved version of: ${text} #professional`;
  }

  let prompt = '';
  switch (mode) {
    case 'professional':
      prompt = `Act as a senior communications expert. Rewrite this LinkedIn post to be professional, impactful, and clear. Maintain the original message: "${text}"`;
      break;
    case 'viral':
      prompt = `Act as a LinkedIn influencer. Rewrite this post to be high-engagement with a strong hook, emojis, and 3 hashtags. Original: "${text}"`;
      break;
    case 'short':
      prompt = `Summarize this LinkedIn post into 1-2 powerful sentences. Original: "${text}"`;
      break;
    case 'grammar':
      prompt = `Fix all grammar and spelling errors in this text. Do not change the tone or meaning. Text: "${text}"`;
      break;
    default:
      prompt = `Improve this LinkedIn post: "${text}"`;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const improvedText = response.text();
    
    if (!improvedText) throw new Error('AI returned an empty response');
    
    console.log('[AI Service] Success! Improved text generated.');
    return improvedText;
  } catch (error) {
    console.error('[AI Service] CRITICAL FAILURE:');
    if (error.status) {
      console.error(`- Status: ${error.status}`);
      console.error(`- Message: ${error.message}`);
    } else {
      console.error(error);
    }
    throw new Error('AI Assistant is currently unavailable. Please try again later.');
  }
};
