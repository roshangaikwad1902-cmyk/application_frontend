export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' = 'light') => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  
  try {
    switch (type) {
      case 'light':
        navigator.vibrate(50);
        break;
      case 'medium':
        navigator.vibrate(100);
        break;
      case 'heavy':
        navigator.vibrate(150);
        break;
      case 'success':
        navigator.vibrate([50, 50, 50]);
        break;
      case 'error':
        navigator.vibrate([100, 50, 100, 50, 100]);
        break;
      case 'warning':
        navigator.vibrate([100, 50, 50]);
        break;
      default:
        navigator.vibrate(50);
    }
  } catch (err) {
    // Ignore errors on devices that don't support vibration
  }
};
