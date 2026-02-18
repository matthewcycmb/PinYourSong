"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface AudioPlayerState {
  currentSongId: string | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  currentTime: number;
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    currentSongId: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    currentTime: 0,
  });

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      setState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
        progress: audio.duration ? (audio.currentTime / audio.duration) * 100 : 0,
      }));
    };

    const onEnded = () => {
      setState((prev) => ({ ...prev, isPlaying: false, progress: 0, currentTime: 0 }));
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, []);

  const play = useCallback((songId: string, previewUrl: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.src !== previewUrl) {
      audio.src = previewUrl;
      audio.load();
    }

    audio.play();
    setState((prev) => ({ ...prev, currentSongId: songId, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const toggle = useCallback(
    (songId: string, previewUrl: string) => {
      if (state.currentSongId === songId && state.isPlaying) {
        pause();
      } else {
        play(songId, previewUrl);
      }
    },
    [state.currentSongId, state.isPlaying, play, pause]
  );

  const seek = useCallback((percent: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (percent / 100) * audio.duration;
  }, []);

  return { ...state, play, pause, toggle, seek };
}
