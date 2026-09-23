// src/presentation/services/VoiceService.ts

import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

export class VoiceService {
  private static instance: VoiceService;

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  async speak(text: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        return this.speakWeb(text);
      }

      // Móvil: usar expo-speech (nativo, compatible con New Architecture)
      return new Promise((resolve) => {
        Speech.speak(text, {
          language: 'es-MX',
          rate: 0.85,
          pitch: 1.0,
          onDone: () => resolve(),
          onError: (error) => {
            console.warn('Error en expo-speech:', error);
            resolve();
          },
        });
      });
    } catch (error) {
      console.error('Error en VoiceService:', error);
      console.log('[Voice Fallback]', text);
    }
  }

  private speakWeb(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.warn('Web Speech API no soportada');
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-MX';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const spanishVoice =
        voices.find((v) => v.lang.startsWith('es') && v.localService) ||
        voices.find((v) => v.lang.startsWith('es'));

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
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } else {
        Speech.stop();
      }
    } catch (error) {
      console.error('Error al detener voz:', error);
    }
  }

  isSpeaking(): boolean {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        return window.speechSynthesis.speaking;
      }
      return false;
    }
    // expo-speech no tiene un método directo para saber si está hablando,
    // pero puedes mantener un estado interno si lo necesitas.
    return false;
  }
}

export default VoiceService.getInstance();