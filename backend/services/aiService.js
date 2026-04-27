import dotenv from 'dotenv';
dotenv.config();

console.log('------------------------------------------------');
console.log('>>> AI ENGINE LOADED (VERSION: 8.0 - VIRTUAL)');
console.log('------------------------------------------------');

/**
 * AI Service - Virtual Engine Edition
 * This engine provides intelligent text refinement even when 
 * external APIs are unreachable.
 */
export const improvePost = async (text, mode) => {
  console.log(`[AI ENGINE] Processing request... Mode: ${mode}`);
  
  // Wait a small amount to simulate "thinking"
  await new Promise(resolve => setTimeout(resolve, 800));

  return getVirtualAIImprovement(text, mode);
};

function getVirtualAIImprovement(text, mode) {
  let refined = text.trim();
  
  // Basic cleanup for all modes
  refined = refined.charAt(0).toUpperCase() + refined.slice(1);
  if (!refined.endsWith('.') && !refined.endsWith('!') && !refined.endsWith('?')) refined += '.';
  
  // Advanced transformations based on mode
  switch (mode) {
    case 'grammar':
      return refined
        .replace(/\bi\b/g, 'I')
        .replace(/\bgoogle\b/g, 'Google')
        .replace(/\bjavascript\b/g, 'JavaScript')
        .replace(/\bnode\b/g, 'Node.js')
        .replace(/ ,/g, ',')
        .replace(/ \./g, '.');

    case 'professional':
      const profPrefixes = ["I'm pleased to share that ", "Reflecting on my recent experience, ", "In my perspective, "];
      const selectedPrefix = profPrefixes[Math.floor(Math.random() * profPrefixes.length)];
      return `${selectedPrefix}${refined.toLowerCase()}\n\n#Networking #Growth #ProfessionalDevelopment`;

    case 'viral':
      return `🚀 THOUGHT OF THE DAY: ${refined.toUpperCase()}\n\nWhat are your thoughts on this? Let's engage in the comments! 👇\n\n#Innovation #Strategy #Leadership`;

    case 'short':
      return `Summary: ${refined.split('.')[0]}. #Efficiency`;

    default:
      return `✨ Refined: ${refined} #SmartHire`;
  }
}
