// Map emotions to their categories
export const emotionCategories = {
  Happy: 'Positive',
  Love: 'Positive',
  Sad: 'Negative',
  Anger: 'Negative',
  Anxiety: 'Negative',
  Confused: 'Neutral',
};

// Pran options organized by category
export const pranOptions = {
  Negative: [
    'मैं अपना mind शांत रखूँगा ।',
    'मैं tension को धीरे-धीरे कम करूँगा ।',
    'मैं शांत रहूँगा ।',
    'मैं खुद को समय दूँगा ।',
  ],
  Neutral: [
    'मैं clearly सोचने की कोशिश करूँगा ।',
    'मैं अपने thoughts को set करूँगा ।',
    'मैं जदबाज़ी नहीं करूँगा ।',
    'मैं calm रहूँगा ।',
  ],
  Positive: [
    'मैं आभार त करूँगा ।',
    'मैं रिश्तों में अच्छा बर्ताव रखूँगा ।',
    'मैं respect जारी रखूँगा ।',
    'मैं सकारात्मक सोच रखूँगा ।',
  ],
};

// Get category from emotion
export const getEmotionCategory = (emotion) => {
  return emotionCategories[emotion] || null;
};

// Get pran options for a category
export const getPranOptions = (category) => {
  return pranOptions[category] || [];
};

