// src/presentation/hooks/useVoiceGuide.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import VoiceService from '../../services/voices/VoiceService';

export interface VoiceStep {
  id: string;
  text: string;
  pauseAfter?: number;
}

export interface UseVoiceGuideReturn {
  isSpeaking: boolean;
  currentStep: number;
  isVoiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  speakStep: (step: VoiceStep, index: number) => Promise<void>;
  speakAllSteps: (steps: VoiceStep[]) => Promise<void>;
  speakText: (text: string) => Promise<void>;
  stopVoice: () => Promise<void>;
  toggleVoice: () => Promise<void>;
}

export function useVoiceGuide(): UseVoiceGuideReturn {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isVoiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const voiceService = VoiceService;
  const isSpeakingRef = useRef(false);

  const speakText = useCallback(async (text: string): Promise<void> => {
    if (!isVoiceEnabled) return;

    try {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      await voiceService.speak(text);
    } catch (error) {
      console.error('Error al hablar:', error);
    } finally {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
  }, [isVoiceEnabled]);

  const speakStep = useCallback(async (step: VoiceStep, index: number): Promise<void> => {
    if (!isVoiceEnabled) return;

    try {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setCurrentStep(index);
      
      await voiceService.speak(step.text);
      
      if (step.pauseAfter) {
        await new Promise(resolve => setTimeout(resolve, step.pauseAfter));
      }
    } catch (error) {
      console.error('Error al hablar paso:', error);
    } finally {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
  }, [isVoiceEnabled]);

  const speakAllSteps = useCallback(async (steps: VoiceStep[]): Promise<void> => {
    if (!isVoiceEnabled || steps.length === 0) return;

    try {
      for (let i = 0; i < steps.length; i++) {
        if (!isSpeakingRef.current) {
          break;
        }
        await speakStep(steps[i], i);
        if (i < steps.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Error al hablar todos los pasos:', error);
    } finally {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setCurrentStep(-1);
    }
  }, [speakStep]);

  const stopVoice = useCallback(async (): Promise<void> => {
    voiceService.stop();
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    setCurrentStep(-1);
  }, []);

  const toggleVoice = useCallback(async (): Promise<void> => {
    if (isSpeaking) {
      await stopVoice();
    }
  }, [isSpeaking, stopVoice]);

  useEffect(() => {
    return () => {
      voiceService.stop();
    };
  }, []);

  return {
    isSpeaking,
    currentStep,
    isVoiceEnabled,
    setVoiceEnabled,
    speakStep,
    speakAllSteps,
    speakText,
    stopVoice,
    toggleVoice,
  };
}

export default useVoiceGuide;