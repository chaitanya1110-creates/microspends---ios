export const triggerHaptic = (pattern: 'light' | 'medium' | 'heavy' | 'success' = 'light') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (pattern === 'light') {
        navigator.vibrate(12);
      } else if (pattern === 'medium') {
        navigator.vibrate(25);
      } else if (pattern === 'heavy') {
        navigator.vibrate(50);
      } else if (pattern === 'success') {
        navigator.vibrate([15, 40, 25]);
      }
    } catch {
      // Haptics ignore if blocked
    }
  }
};
