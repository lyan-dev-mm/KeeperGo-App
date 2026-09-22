// src/presentation/services/VoiceService.ts

import { Platform } from 'react-native';

export class VoiceService {
  private static instance: VoiceService;
  private ttsModule: any = null;
  private initialized: boolean = false;

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  private async initTts() {
    if (this.initialized) return;
    if (Platform.OS === 'web') return;

    try {
      // ✅ Intentar cargar expo-av dinámicamente
      const { Audio } = await import('expo-av');
      this.ttsModule = Audio;
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      this.initialized = true;
    } catch (error) {
      console.warn('expo-av no disponible:', error);
      this.ttsModule = null;
    }
  }

  async speak(text: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // ✅ Web: usar Web Speech API (siempre funciona)
        return this.speakWeb(text);
      }

      // ✅ Móvil: intentar con expo-av
      await this.initTts();
      
      if (this.ttsModule) {
        // Usar expo-av para síntesis de voz
        // Nota: expo-av no tiene TTS nativo, necesitamos una alternativa
        // Por ahora, usamos la web como fallback
        return this.speakWeb(text);
      } else {
        // Fallback: mostrar en consola
        console.log('[Voice]', text);
        // Usar la web también en móvil si falla expo-av
        return this.speakWeb(text);
      }
    } catch (error) {
      console.error('Error en VoiceService:', error);
      // Fallback final: mostrar en consola
      console.log('[Voice Fallback]', text);
    }
  }

  private speakWeb(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        console.warn('Web Speech API no soportada');
        resolve();
        return;
      }

      // ✅ Cancelar cualquier síntesis anterior
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-MX';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1;

      // Buscar voz en español
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(
        (voice) => voice.lang.startsWith('es') && voice.localService
      ) || voices.find((voice) => voice.lang.startsWith('es'));
      
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        console.warn('Error en Web Speech:', event);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  stop(): void {
    try {
      if (Platform.OS === 'web' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      } else if (this.ttsModule) {
        // Detener expo-av
        // this.ttsModule.stop();
      }
    } catch (error) {
      console.error('Error al detener voz:', error);
    }
  }

  isSpeaking(): boolean {
    if (Platform.OS === 'web' && window.speechSynthesis) {
      return window.speechSynthesis.speaking;
    }
    return false;
  }
}

export default VoiceService.getInstance();