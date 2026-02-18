"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAudioPlayer, type AudioPlayerState } from "@/hooks/useAudioPlayer";

interface AudioContextValue extends AudioPlayerState {
  play: (songId: string, previewUrl: string) => void;
  pause: () => void;
  toggle: (songId: string, previewUrl: string) => void;
  seek: (percent: number) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const player = useAudioPlayer();
  return <AudioContext.Provider value={player}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioPlayerProvider");
  return ctx;
}
