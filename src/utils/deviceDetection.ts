/**
 * Utility functions for device detection and browser capability checking
 */

export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

export const isAndroid = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  return /Android/i.test(navigator.userAgent);
};

export const isSafari = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const isChrome = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
};

export const supportsWebSpeech = (): boolean => {
  return typeof window !== 'undefined' && 
         (window.SpeechRecognition !== undefined || 
          window.webkitSpeechRecognition !== undefined);
};

export const supportsSpeechSynthesis = (): boolean => {
  return typeof window !== 'undefined' && 
         window.speechSynthesis !== undefined;
};

export const getDeviceInfo = () => {
  return {
    isMobile: isMobileDevice(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isSafari: isSafari(),
    isChrome: isChrome(),
    supportsWebSpeech: supportsWebSpeech(),
    supportsSpeechSynthesis: supportsSpeechSynthesis(),
  };
};

export default {
  isMobileDevice,
  isIOS,
  isAndroid,
  isSafari,
  isChrome,
  supportsWebSpeech,
  supportsSpeechSynthesis,
  getDeviceInfo
};