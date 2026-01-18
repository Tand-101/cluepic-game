// src/utils/imageEffects.js
// Amendment 5: Image distortion effects

// Get effect type based on puzzle ID (deterministic)
export const getEffectType = (puzzleId) => {
  const effects = ['blur', 'pixelate', 'swirl', 'noise', 'rgb-shift']
  const hash = puzzleId ? puzzleId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0
  return effects[hash % effects.length]
}

// Calculate effect severity based on attempt (1-5)
// Amendment 4: Adjusted severity levels
export const getEffectSeverity = (attempt, maxAttempts = 5) => {
  // Attempt 1: High severity (like old attempt 3)
  // Attempt 2-4: Gradually decrease
  // Attempt 5: No effect (fully clear)
  
  const severityLevels = {
    1: 1.0,   // 100% severity
    2: 0.65,  // 65% severity
    3: 0.35,  // 35% severity
    4: 0.15,  // 15% severity
    5: 0      // 0% severity (clear)
  }
  
  return severityLevels[attempt] || 0
}

// Generate CSS filter string based on effect type and severity
export const generateFilterCSS = (effectType, severity) => {
  if (severity === 0) return 'none'
  
  switch (effectType) {
    case 'blur':
      // Blur: 0-20px
      return `blur(${Math.round(severity * 20)}px)`
    
    case 'pixelate':
      // Pixelation using contrast + blur
      const pixelSize = Math.round(severity * 15)
      return `blur(${pixelSize}px) contrast(${1 + severity * 0.5})`
    
    case 'swirl':
      // Swirl effect using hue-rotate + blur
      const swirlAngle = Math.round(severity * 180)
      const swirlBlur = Math.round(severity * 8)
      return `blur(${swirlBlur}px) hue-rotate(${swirlAngle}deg) saturate(${1 + severity * 0.5})`
    
    case 'noise':
      // Noise/grain effect using contrast + brightness
      const contrast = 1 + (severity * 0.8)
      const brightness = 1 - (severity * 0.3)
      return `contrast(${contrast}) brightness(${brightness}) grayscale(${severity * 0.4})`
    
    case 'rgb-shift':
      // RGB shift using hue-rotate + saturate
      const hueShift = Math.round(severity * 30)
      const saturation = 1 + (severity * 1.5)
      return `hue-rotate(${hueShift}deg) saturate(${saturation}) blur(${Math.round(severity * 5)}px)`
    
    default:
      return `blur(${Math.round(severity * 20)}px)`
  }
}

// Get effect name for display
export const getEffectName = (effectType) => {
  const names = {
    'blur': 'Blur',
    'pixelate': 'Pixelate',
    'swirl': 'Swirl',
    'noise': 'Noise',
    'rgb-shift': 'Color Shift'
  }
  return names[effectType] || 'Effect'
}

// Apply effect to image element
export const applyImageEffect = (effectType, attempt) => {
  const severity = getEffectSeverity(attempt)
  return generateFilterCSS(effectType, severity)
}
