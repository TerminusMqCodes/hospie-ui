/**
 * Liquid Glass (Glassmorphism) Composable
 * iOS stílusú üveghatás Quasar komponensekhez
 */

export function useLiquidGlass() {
  // Különböző intenzitású glass stílusok
  const glassStyles = {
    light: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.2)'
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
    },
    heavy: {
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(30px) saturate(200%)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.5)'
    },
    dark: {
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
    }
  }

  // Glass stílus alkalmazása elemre
  const applyGlassStyle = (intensity = 'medium') => {
    return glassStyles[intensity] || glassStyles.medium
  }

  // Glass card osztályok generálása
  const getGlassClasses = (options = {}) => {
    const {
      rounded = true,
      hover = true,
      animated = true
    } = options

    const classes = ['liquid-glass']
    
    if (rounded) classes.push('liquid-glass-rounded')
    if (hover) classes.push('liquid-glass-hover')
    if (animated) classes.push('liquid-glass-animated')

    return classes.join(' ')
  }

  return {
    glassStyles,
    applyGlassStyle,
    getGlassClasses
  }
}
