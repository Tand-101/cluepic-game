// src/utils/imageEffects.js
// Amendment 4: Only 3 effects (Blur, Pixelate, Swirl), harder starting difficulty

// Get effect type based on puzzle ID (deterministic)
export const getEffectType = (puzzleId) => {
  const effects = ['blur', 'pixelate', 'swirl'];
  const hash = puzzleId ? puzzleId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  return effects[hash % effects.length];
};

// Amendment 4: Calculate effect severity - starts harder (like old level 4)
export const getEffectSeverity = (attempt, maxAttempts = 5) => {
  // Attempt 1: Maximum severity (100% - hardest)
  // Attempt 2: 70% severity  
  // Attempt 3: 45% severity
  // Attempt 4: 20% severity
  // Attempt 5: 0% severity (fully clear)
  
  const severityLevels = {
    1: 1.0,   // 100% severity (hardest - original level 4)
    2: 0.70,  // 70% severity
    3: 0.45,  // 45% severity  
    4: 0.20,  // 20% severity
    5: 0      // 0% severity (clear)
  };
  
  return severityLevels[attempt] || 0;
};

// Generate CSS filter string based on effect type and severity
export const generateFilterCSS = (effectType, severity) => {
  if (severity === 0) return 'none';
  
  switch (effectType) {
    case 'blur':
      // Blur: 0-30px (increased from 20px for harder difficulty)
      const blurPx = Math.round(severity * 30);
      return `blur(${blurPx}px)`;
    
    case 'pixelate':
      // Pixelation using blur + contrast
      const pixelBlur = Math.round(severity * 20);
      const pixelContrast = 1 + (severity * 0.6);
      return `blur(${pixelBlur}px) contrast(${pixelContrast})`;
    
    case 'swirl':
      // Swirl effect using hue-rotate + blur + saturate
      const swirlAngle = Math.round(severity * 240); // Increased rotation
      const swirlBlur = Math.round(severity * 12); // Increased blur
      const swirlSat = 1 + (severity * 0.7);
      return `blur(${swirlBlur}px) hue-rotate(${swirlAngle}deg) saturate(${swirlSat})`;
    
    default:
      return `blur(${Math.round(severity * 30)}px)`;
  }
};

// Get effect name for display
export const getEffectName = (effectType) => {
  const names = {
    'blur': 'Blur',
    'pixelate': 'Pixelate',
    'swirl': 'Swirl'
  };
  return names[effectType] || 'Effect';
};

// Apply effect to image element
export const applyImageEffect = (effectType, attempt) => {
  const severity = getEffectSeverity(attempt);
  return generateFilterCSS(effectType, severity);
};
