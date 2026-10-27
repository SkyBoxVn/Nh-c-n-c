import React, { useState } from 'react';
import { CameraViewMode, FountainTheme } from '../types';
import { FOUNTAIN_THEMES } from '../data/themesAndSongs';
import {
  ChevronDown,
  ChevronUp,
  Volume2,
  Camera,
  Palette,
  Zap,
  Sliders,
  Maximize2
} from 'lucide-react';

interface BottomControlDockProps {
  currentHeight: number;
  maxHeightReached: number;
  currentDecibels: number;
  currentTheme: FountainTheme;
  onSelectTheme: (theme: FountainTheme) => void;
  cameraMode: CameraViewMode;
  onSelectCameraMode: (mode: CameraViewMode) => void;
  simulatedVolume: number;
  onSimulatedVolumeChange: (vol: number) => void;
  isMicActive: boolean;
  onTriggerLaser: () => void;
  playerName: string;
  onEditPlayerName: () => void;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  currentHeight,
  maxHeightReached,
  currentDecibels,
  currentTheme,
  onSelectTheme,
  cameraMode,
  onSelectCameraMode,
  simulatedVolume,
  onSimulatedVolumeChange,
  isMicActive,
  onTriggerLaser,
  playerName,
  onEditPlayerName,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'gauge' | 'camera' | 'themes' | 'simulator'>('gauge');

  // Height milestone tiers
  const getHeightTier = (h: number) => {
    if (h >= 80) return { label: 'SIÊU GEYSER 100M - GRAND VOUCHER', color: 'text-rose-400' };
    if (h >= 55) return { label: 'ĐỈNH CAO HOÀNG GIA - GOLD VOUCHER', color: 'text-amber-300' };
    if (h >= 30) return { label: 'THĂNG HOA NĂNG LƯỢNG - SILVER', color: 'text-cyan-300' };
    return { label: 'KHỞI ĐỘNG NHẠC NƯỚC', color: 'text-slate-400' };
  };

  const tier = getHeightTier(currentHeight);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-[960px] px-4 pointer-events-none">
      {/* Collapse Toggle Tab */}
      <div className="flex justify-center mb-1 pointer-events-auto">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="px-4 py-1 text-xs font-semibold text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-t-lg backdrop-blur-md flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hiện Bảng Điều Khiển Nhạc Nước (Phím H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Ẩn Bảng Điều Khiển (Chế Độ Thưởng Thức)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock Container */}
      {!isCollapsed && (
        <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-4 shadow-2xl text-slate-200">
          {/* Top Bar inside Dock: Live Metric & Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            {/* Live Height & Decibels */}
            <div className="flex items-center gap-4">
              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Cột Nước Hiện Tại</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-black text-cyan-400 tabular-nums">
                    {currentHeight.toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">mét</span>
                  <span className="text-xs text-slate-500 font-mono">/ kỷ lục {maxHeightReached.toFixed(1)}m</span>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-800 hidden sm:block" />

              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Âm Lượng Giọng Hát</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-black text-amber-300 tabular-nums">
                    {currentDecibels}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">dB</span>
                  <span className={`text-[11px] font-semibold hidden md:inline ml-2 ${tier.color}`}>
                    {tier.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Laser Name & Manual Trigger */}
            <div className="flex items-center gap-2">
              <button
                onClick={onEditPlayerName}
                className="px-2.5 py-1 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Thay đổi họ tên chiếu laser"
              >
                <span className="text-slate-400">Laser:</span>
                <span className="font-bold">{playerName}</span>
              </button>

              <button
                onClick={onTriggerLaser}
                className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 rounded-lg shadow-sm shadow-pink-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Bắn Laser</span>
              </button>
            </div>
          </div>

          {/* Real-time Height Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>0m</span>
              <span>25m</span>
              <span>50m (Voucher Silver)</span>
              <span>75m (Voucher Gold)</span>
              <span className="text-amber-400 font-bold">100m (Voucher 1 Triệu VNĐ)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full rounded-full transition-all duration-100 ease-out bg-gradient-to-r from-sky-500 via-cyan-400 via-amber-400 to-rose-500 shadow-sm"
                style={{ width: `${Math.min(100, Math.max(5, currentHeight))}%` }}
              />
            </div>
          </div>

          {/* Sub-dock Tab Navigation */}
          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('gauge')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'gauge' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hát & Cột Nước</span>
              </button>
              <button
                onClick={() => setActiveTab('camera')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'camera' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Góc Quay</span>
              </button>
              <button
                onClick={() => setActiveTab('themes')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'themes' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Chủ Đề Nhạc Nước</span>
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'simulator' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Thử Giọng Ảo</span>
              </button>
            </div>

            <div className="text-xs text-slate-400 hidden lg:block">
              {isMicActive ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Micro đang thu: Hãy cất cao giọng hát!
                </span>
              ) : (
                <span className="text-amber-400">Gợi ý: Bật Micro hoặc kéo thanh Thử Giọng Ảo</span>
              )}
            </div>
          </div>

          {/* Tab Content Panes */}
          <div className="mt-3">
            {/* 1. Camera Viewpoints */}
            {activeTab === 'camera' && (
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'front_vip', label: 'Khán Đài VIP (Chính Diện)' },
                  { id: 'drone', label: 'Flycam Toàn Cảnh (Góc Cao)' },
                  { id: 'laser_focus', label: 'Cận Cảnh Laser Tên' },
                  { id: 'top_down', label: 'Hình Chiếu Bằng (Choreography)' },
                  { id: 'orbit', label: 'Xoay Tự Do (Kéo Chuột)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectCameraMode(item.id as CameraViewMode)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                      cameraMode === item.id
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* 2. Theme Selection */}
            {activeTab === 'themes' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {FOUNTAIN_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => onSelectTheme(theme)}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      currentTheme.id === theme.id
                        ? 'bg-slate-900 border-cyan-400 shadow-md ring-1 ring-cyan-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                      <span className="text-xs font-bold text-slate-200 truncate">{theme.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{theme.tagline}</div>
                  </button>
                ))}
              </div>
            )}

            {/* 3. Simulated Volume Slider (Great for quiet environments or testing) */}
            {activeTab === 'simulator' && (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                <div className="text-xs text-slate-300 shrink-0">
                  <div className="font-bold text-white">Thanh Kéo Nội Lực Giọng Hát:</div>
                  <div className="text-[11px] text-slate-400">Dùng khi không tiện mở mic hoặc muốn thử Geyser 100m</div>
                </div>

                <div className="flex-1 w-full flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">0%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={simulatedVolume}
                    onChange={(e) => onSimulatedVolumeChange(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <span className="text-xs font-mono font-bold text-cyan-300 w-12 text-right">
                    {Math.round(simulatedVolume * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSimulatedVolumeChange(0.35)}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded-md text-slate-300 cursor-pointer"
                  >
                    35m
                  </button>
                  <button
                    onClick={() => onSimulatedVolumeChange(0.7)}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded-md text-slate-300 cursor-pointer"
                  >
                    70m
                  </button>
                  <button
                    onClick={() => onSimulatedVolumeChange(1.0)}
                    className="px-2.5 py-1 text-xs bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 rounded-md text-rose-300 font-bold cursor-pointer"
                  >
                    Max 100m!
                  </button>
                </div>
              </div>
            )}

            {/* 4. Gauge & Tips */}
            {activeTab === 'gauge' && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Quy tắc: Hát càng to và vang, áp lực nước càng dâng cao. Cột nước trên 80m nhận ngay Voucher Haidilao 1 Triệu!</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-slate-300">
                  <span>Mẹo: Giữ hơi thở đều đặn và ngân dài các nốt cao trào</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
