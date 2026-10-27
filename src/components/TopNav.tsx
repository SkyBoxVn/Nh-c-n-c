import React from 'react';
import { Sparkles, Award, Music, Ticket, Play, Square, Mic } from 'lucide-react';

interface TopNavProps {
  onOpenSongSelect: () => void;
  onOpenLeaderboard: () => void;
  onOpenVouchers: () => void;
  onOpenRules: () => void;
  isPlaying: boolean;
  onStartShow: () => void;
  onEndShow: () => void;
  isMicActive: boolean;
  onToggleMic: () => void;
  voucherCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenSongSelect,
  onOpenLeaderboard,
  onOpenVouchers,
  onOpenRules,
  isPlaying,
  onStartShow,
  onEndShow,
  isMicActive,
  onToggleMic,
  voucherCount,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-6 px-6 py-3.5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 via-cyan-400 to-amber-300 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-display text-lg font-bold tracking-wider text-white whitespace-nowrap group-hover:text-cyan-300 transition-colors">
            VŨ ĐIỆU NHẠC NƯỚC
          </span>
        </a>
      </div>

      {/* Zone 2: 4-5 clean single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={onOpenSongSelect}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
        >
          <Music className="w-4 h-4 text-cyan-400" />
          <span>Chọn Bài Hát</span>
        </button>
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Bảng Xếp Hạng</span>
        </button>
        <button
          onClick={onOpenVouchers}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap cursor-pointer relative"
        >
          <Ticket className="w-4 h-4 text-emerald-400" />
          <span>Ví Voucher</span>
          {voucherCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-[11px] font-mono font-bold bg-emerald-500 text-slate-950 rounded">
              {voucherCount}
            </span>
          )}
        </button>
        <button
          onClick={onOpenRules}
          className="hover:text-white transition-colors whitespace-nowrap cursor-pointer text-slate-400 hover:text-slate-200"
        >
          Quy Tắc Thưởng
        </button>
      </nav>

      {/* Zone 3: Primary action + Mic trigger */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleMic}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            isMicActive
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
          title={isMicActive ? 'Micro đang bật' : 'Nhấn để bật Micro thu âm giọng hát'}
        >
          <Mic className={`w-3.5 h-3.5 ${isMicActive ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">{isMicActive ? 'Mic: Đang Thu' : 'Bật Mic'}</span>
        </button>

        {isPlaying ? (
          <button
            onClick={onEndShow}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 rounded-lg shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Kết Thúc & Nhận Voucher</span>
          </button>
        ) : (
          <button
            onClick={onStartShow}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-lg shadow-md shadow-amber-400/20 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Bắt Đầu Biểu Diễn</span>
          </button>
        )}
      </div>
    </header>
  );
};
