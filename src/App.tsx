/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FountainScene } from './three/FountainScene';
import { soundEngine } from './audio/soundEngine';
import {
  CameraViewMode,
  FountainTheme,
  LeaderboardEntry,
  LyricLine,
  RestaurantVoucher,
  SingingPerformance,
  SongTrack,
} from './types';
import {
  FOUNTAIN_THEMES,
  INITIAL_LEADERBOARD,
  RESTAURANT_VOUCHERS,
  SONG_TRACKS,
} from './data/themesAndSongs';
import { TopNav } from './components/TopNav';
import { BottomControlDock } from './components/BottomControlDock';
import { KaraokeLyricsDisplay } from './components/KaraokeLyricsDisplay';
import { SongSelectionModal } from './components/SongSelectionModal';
import { VictoryVoucherModal } from './components/VictoryVoucherModal';
import { VoucherWalletModal } from './components/VoucherWalletModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { RulesModal } from './components/RulesModal';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<FountainScene | null>(null);

  // Core Game State
  const [playerName, setPlayerName] = useState<string>('NGUYỄN VĂN AN');
  const [selectedSong, setSelectedSong] = useState<SongTrack>(SONG_TRACKS[0]);
  const [currentTheme, setCurrentTheme] = useState<FountainTheme>(FOUNTAIN_THEMES[0]);
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('front_vip');

  // Performance & Audio State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [simulatedVolume, setSimulatedVolume] = useState<number>(0.25);
  const [currentHeight, setCurrentHeight] = useState<number>(12);
  const [maxHeightReached, setMaxHeightReached] = useState<number>(12);
  const [currentDecibels, setCurrentDecibels] = useState<number>(40);
  const [songProgressSec, setSongProgressSec] = useState<number>(0);
  const [currentLyric, setCurrentLyric] = useState<LyricLine | null>(null);
  const [nextLyric, setNextLyric] = useState<LyricLine | null>(null);

  // Modals
  const [showSongModal, setShowSongModal] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  // User Vouchers & Leaderboard
  const [userVouchers, setUserVouchers] = useState<RestaurantVoucher[]>(() => {
    try {
      const saved = localStorage.getItem('water_fountain_vouchers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem('water_fountain_leaderboard');
      return saved ? JSON.parse(saved) : INITIAL_LEADERBOARD;
    } catch {
      return INITIAL_LEADERBOARD;
    }
  });

  const [lastPerformance, setLastPerformance] = useState<SingingPerformance | null>(null);
  const [awardedVoucher, setAwardedVoucher] = useState<RestaurantVoucher | null>(null);

  // Initialize Three.js 3D Scene once
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new FountainScene(mountRef.current, currentTheme, playerName);
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Sync theme changes with 3D scene
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setTheme(currentTheme);
    }
  }, [currentTheme]);

  // Sync player name changes with 3D laser hologram
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setPlayerName(playerName);
    }
  }, [playerName]);

  // Sync camera view changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setCameraMode(cameraMode);
    }
  }, [cameraMode]);

  // Real-time audio polling & fountain physical height loop
  useEffect(() => {
    let animId: number;

    const updateLoop = () => {
      const metrics = soundEngine.getAudioMetrics();
      setCurrentHeight(metrics.heightMeters);
      setCurrentDecibels(metrics.decibels);

      if (sceneRef.current) {
        sceneRef.current.setVocalPower(metrics.heightMeters);
      }

      if (isPlaying) {
        setMaxHeightReached((prev) => Math.max(prev, metrics.heightMeters));
      }

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Song playback timer & lyrics synchronization
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setSongProgressSec((prev) => {
        const nextTime = prev + 0.5;

        // Find current and next lyric lines
        const lyrics = selectedSong.lyrics;
        const currentIdx = lyrics.findIndex(
          (line) => nextTime >= line.time && nextTime < line.time + line.duration
        );

        if (currentIdx !== -1) {
          setCurrentLyric(lyrics[currentIdx]);
          setNextLyric(currentIdx + 1 < lyrics.length ? lyrics[currentIdx + 1] : null);
        } else {
          // If past last line or in between
          const upcoming = lyrics.find((line) => line.time > nextTime);
          setNextLyric(upcoming || null);
          if (!upcoming && nextTime >= selectedSong.duration) {
            // Song completed! Trigger victory
            handleFinishShow();
          }
        }

        return nextTime;
      });
    }, 500);

    return () => clearInterval(timer);
  }, [isPlaying, selectedSong]);

  // Start performance show
  const handleStartShow = async () => {
    await soundEngine.initAudio();
    soundEngine.startMusic(selectedSong.bpm, selectedSong.chords);
    setMaxHeightReached(12);
    setSongProgressSec(0);
    setIsPlaying(true);
  };

  // End performance show & calculate restaurant voucher rewards
  const handleFinishShow = useCallback(() => {
    soundEngine.stopMusic();
    setIsPlaying(false);

    // Determine performance rewards based on peak fountain height
    const finalHeight = Math.max(maxHeightReached, currentHeight);
    let rank = 'Quán Quân Nhạc Nước (Grand Master)';
    let voucher: RestaurantVoucher = RESTAURANT_VOUCHERS[0]; // Haidilao 1M
    let baseScore = 9500;

    if (finalHeight >= 80) {
      rank = '🥇 Quán Quân Thần Thoại (Grand Champion - Geyser 100m)';
      voucher = RESTAURANT_VOUCHERS[0]; // Haidilao 1,000,000đ
      baseScore = Math.round(9200 + (finalHeight / 100) * 800);
    } else if (finalHeight >= 60) {
      rank = '🥈 Ngôi Sao Nhạc Nước (Gold Master - Cột Nước Hoàng Gia)';
      voucher = RESTAURANT_VOUCHERS[1]; // Golden Gate 500,000đ
      baseScore = Math.round(7500 + ((finalHeight - 60) / 20) * 1500);
    } else if (finalHeight >= 40) {
      rank = '🥉 Giọng Ca Triển Vọng (Silver Star - Vũ Điệu Sóng Biếc)';
      voucher = RESTAURANT_VOUCHERS[2]; // Pizza 4P's 300,000đ
      baseScore = Math.round(5500 + ((finalHeight - 40) / 20) * 1800);
    } else {
      rank = '🎁 Khúc Ca Nhiệt Huyết (Bronze Vocalist - Năng Lượng Tỏa Sáng)';
      voucher = RESTAURANT_VOUCHERS[3]; // Dookki 200,000đ
      baseScore = Math.round(3800 + (finalHeight / 40) * 1500);
    }

    const performanceResult: SingingPerformance = {
      playerName,
      songTitle: selectedSong.title,
      maxHeightMeters: finalHeight,
      currentHeightMeters: currentHeight,
      peakDb: Math.round(currentDecibels),
      avgDb: Math.round(currentDecibels * 0.9),
      score: baseScore,
      singingStability: 96,
      laserIntensity: 1.0,
      rankTitle: rank,
      unlockedVoucher: voucher,
    };

    setLastPerformance(performanceResult);
    setAwardedVoucher(voucher);

    // Add to user vouchers wallet
    setUserVouchers((prev) => {
      const updated = [voucher, ...prev.filter((v) => v.id !== voucher.id)];
      try {
        localStorage.setItem('water_fountain_vouchers', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Add entry to leaderboard
    const newEntry: LeaderboardEntry = {
      id: `lead_${Date.now()}`,
      playerName,
      songTitle: selectedSong.title,
      heightMeters: finalHeight,
      score: baseScore,
      peakDb: currentDecibels,
      themeName: currentTheme.name,
      date: 'Vừa xong',
      voucherEarned: `${voucher.brand} ${voucher.discountValue}`,
    };

    setLeaderboard((prev) => {
      const updated = [newEntry, ...prev]
        .sort((a, b) => b.heightMeters - a.heightMeters)
        .slice(0, 10);
      try {
        localStorage.setItem('water_fountain_leaderboard', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setShowVictoryModal(true);
  }, [maxHeightReached, currentHeight, playerName, selectedSong, currentTheme, currentDecibels]);

  // Toggle Microphone
  const handleToggleMic = async () => {
    if (isMicActive) {
      soundEngine.stopMicrophone();
      setIsMicActive(false);
    } else {
      const ok = await soundEngine.startMicrophone();
      setIsMicActive(ok);
      if (!ok) {
        alert(
          'Không thể truy cập Microphone (hoặc quyền bị chặn trong trình duyệt). Bạn có thể dùng thanh "Thử Giọng Ảo" ở bảng điều khiển để đẩy cột nước lên 100m!'
        );
      }
    }
  };

  // Change simulated volume slider
  const handleSimulatedVolumeChange = (vol: number) => {
    setSimulatedVolume(vol);
    soundEngine.setSimulatedVolume(vol);
  };

  // Laser manual trigger
  const handleTriggerLaser = () => {
    soundEngine.triggerLaserSound();
    if (sceneRef.current) {
      sceneRef.current.updateLaserHologramCanvas();
    }
  };

  // Keyboard shortcut 'H' for Cinema Mode / HUD toggle
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        const toggleBtn = document.querySelector('button[title*="Phím H"]') as HTMLButtonElement;
        toggleBtn?.click();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
      />

      {/* Top Bar Navigation (Zone 1 - Wordmark, Zone 2 - Links, Zone 3 - Action) */}
      <TopNav
        onOpenSongSelect={() => setShowSongModal(true)}
        onOpenLeaderboard={() => setShowLeaderboardModal(true)}
        onOpenVouchers={() => setShowWalletModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
        isPlaying={isPlaying}
        onStartShow={handleStartShow}
        onEndShow={handleFinishShow}
        isMicActive={isMicActive}
        onToggleMic={handleToggleMic}
        voucherCount={userVouchers.length}
      />

      {/* Floating Karaoke Lyrics Display (when performing) */}
      {isPlaying && (
        <KaraokeLyricsDisplay
          currentLyric={currentLyric}
          nextLyric={nextLyric}
          songTitle={selectedSong.title}
          artist={selectedSong.artist}
          currentHeight={currentHeight}
          currentDecibels={currentDecibels}
        />
      )}

      {/* Bottom Control Dock (Consolidated Ergonomic 3D HUD) */}
      <BottomControlDock
        currentHeight={currentHeight}
        maxHeightReached={maxHeightReached}
        currentDecibels={currentDecibels}
        currentTheme={currentTheme}
        onSelectTheme={(theme) => setCurrentTheme(theme)}
        cameraMode={cameraMode}
        onSelectCameraMode={(mode) => setCameraMode(mode)}
        simulatedVolume={simulatedVolume}
        onSimulatedVolumeChange={handleSimulatedVolumeChange}
        isMicActive={isMicActive}
        onTriggerLaser={handleTriggerLaser}
        playerName={playerName}
        onEditPlayerName={() => setShowSongModal(true)}
      />

      {/* Modals */}
      <SongSelectionModal
        isOpen={showSongModal}
        onClose={() => setShowSongModal(false)}
        selectedSong={selectedSong}
        onSelectSong={(song) => {
          setSelectedSong(song);
          // Set matching theme if desired
          const matched = FOUNTAIN_THEMES.find((t) => t.id === song.themeId);
          if (matched) setCurrentTheme(matched);
        }}
        playerName={playerName}
        onUpdatePlayerName={(name) => setPlayerName(name)}
        onStartShow={handleStartShow}
      />

      {lastPerformance && awardedVoucher && (
        <VictoryVoucherModal
          isOpen={showVictoryModal}
          onClose={() => setShowVictoryModal(false)}
          performance={lastPerformance}
          voucher={awardedVoucher}
          onSaveToWallet={(voucher) => {
            setUserVouchers((prev) => [voucher, ...prev.filter((v) => v.id !== voucher.id)]);
          }}
          onPlayAgain={() => {
            setShowVictoryModal(false);
            handleStartShow();
          }}
        />
      )}

      <VoucherWalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        vouchers={userVouchers}
        onStartSinging={() => {
          setShowWalletModal(false);
          handleStartShow();
        }}
      />

      <LeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        entries={leaderboard}
        currentPlayerName={playerName}
      />

      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        onStartShow={() => {
          setShowRulesModal(false);
          handleStartShow();
        }}
      />
    </div>
  );
}
