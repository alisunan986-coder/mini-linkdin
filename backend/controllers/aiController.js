import * as aiService from '../services/aiService.js';

/**
 * AI Controller - Handles HTTP requests for AI features
 */
export const handleImprovePost = async (req, res) => {
  const { text, mode } = req.body;

  if (!text || text.trim().length < 5) {
    return res.status(400).json({ error: 'Text must be at least 5 characters long.' });
  }

  const validModes = ['professional', 'short', 'viral', 'grammar'];
  if (!validModes.includes(mode)) {
    return res.status(400).json({ error: 'Invalid improvement mode selected.' });
  }

  try {
    console.log(`[AI Controller] Improving post in '${mode}' mode...`);
    const improvedText = await aiService.improvePost(text, mode);
    
    res.json({
      original: text,
      improved: improvedText,
      mode
    });
  } catch (error) {
    console.error('[AI Controller] Error:', error.message);
    res.status(500).json({ error: error.message || 'Server error during AI processing' });
  }
};
