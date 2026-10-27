import React from 'react';
import { LyricLine } from '../types';
import { Music, Volume2 } from 'lucide-react';

interface KaraokeLyricsDisplayProps {
  currentLyric: LyricLine | null;
  nextLyric: LyricLine | null;
  songTitle: string;
  artist: string;
  currentHeight: number;
  currentDecibels: number;
}

export const KaraokeLyricsDisplay: React.FC<KaraokeLyricsDisplayProps> = ({
  currentLyric,
  nextLyric,
  songTitle,
  artist,
  currentHeight,
  currentDecibels,
}) => {
  // Singing motivational cheers based on height
  const getSingingCheer = (h: number, db: number) => {
    if (h >= 85) return '🔥 TUYỆT ĐỈNH NỘI LỰC! CỘT NƯỚC CHẠM 100M!';
    if (h >= 60) return '⚡ CỰC KỲ XUẤT SẮC! CỘT NƯỚC DÂNG CAO!';
    if (h >= 35) return '🎵 GIAI ĐIỆU TUYỆT VỜI! HÁT TO HƠN NỮA NÀO!';
    if (db > 60) return '🎤 BẮT ĐẦU VÀO NHỊP! HÃY NGÂN DÀI CÂU HÁT!';
    return '🎤 Hãy cất cao giọng hát để đẩy cột nước lên cao!';
  };

  const cheer = getSingingCheer(currentHeight, currentDecibels);

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4 pointer-events-none">
      <div className="bg-slate-950/75 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 text-center shadow-2xl">
        {/* Track info header */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-1.5 truncate">
            <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-200 truncate">{songTitle}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 truncate">{artist}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
            <Volume2 className="w-3 h-3 text-amber-400" />
            <span className="text-amber-300 font-bold">{currentDecibels} dB</span>
          </div>
        </div>

        {/* Current Lyric line */}
        <div className="min-h-[52px] flex items-center justify-center">
          {currentLyric ? (
            <p className="font-display text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-amber-200 tracking-wide drop-shadow-md">
              {currentLyric.text}
            </p>
          ) : (
            <p className="text-base text-slate-400 font-medium">
              Chuẩn bị vào điệp khúc... Lấy hơi thật sâu!
            </p>
          )}
        </div>

        {/* Next Lyric preview */}
        {nextLyric && (
          <div className="text-xs text-slate-400/80 mt-1 truncate">
            Câu tiếp: <span className="italic">{nextLyric.text}</span>
          </div>
        )}

        {/* Dynamic singing prompt & cheer */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-300 tracking-wide">
            {cheer}
          </span>
        </div>
      </div>
    </div>
  );
};
