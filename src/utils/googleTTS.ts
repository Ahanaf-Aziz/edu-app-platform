
// Google Text-to-Speech utility
export interface GoogleTTSOptions {
  text: string;
  voice?: 'male' | 'female' | 'neutral';
  speed?: number; // 0.5 to 2.0
  pitch?: number; // -20 to 20
  language?: string; // e.g. 'en-US', 'es-ES'
}

// This is a simulated Google TTS function since we'd normally use their API with credentials
export const speakWithGoogleTTS = async ({
  text,
  voice = 'neutral',
  speed = 1.0,
  pitch = 0,
  language = 'en-US'
}: GoogleTTSOptions): Promise<void> => {
  if (!text) return;
  
  // In a real implementation, we would call Google's Text-to-Speech API here
  // For now, we'll use the browser's built-in speech synthesis as a fallback
  
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map our simplified options to browser speech settings
    utterance.lang = language;
    utterance.rate = speed;
    utterance.pitch = 1 + (pitch / 20); // Convert our pitch range to browser range
    
    // Select a voice that matches the requested type
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Try to find a voice matching the requested gender
      const genderMatch = voice === 'male' ? 'male' : voice === 'female' ? 'female' : '';
      const matchingVoice = voices.find(v => 
        v.lang.includes(language.split('-')[0]) && 
        (genderMatch ? v.name.toLowerCase().includes(genderMatch) : true)
      );
      
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    }
    
    // Log our TTS parameters
    console.log(`Speaking with Google TTS (simulated): "${text.substring(0, 30)}..."`);
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Error with text-to-speech:', error);
  }
};
