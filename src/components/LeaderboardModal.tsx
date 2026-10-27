import React from 'react';
import { LeaderboardEntry } from '../types';
import { X, Award, Flame, Volume2, Trophy, Ticket } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  currentPlayerName: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  entries,
  currentPlayerName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Bảng Vàng Kỷ Lục Nhạc Nước</h2>
              <p className="text-xs text-slate-400">
                Tôn vinh những giọng hát nội lực nhất với các cột nước vút bay chạm trời
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="p-5 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Hạng</th>
                  <th className="py-2.5 px-3">Người Biểu Diễn</th>
                  <th className="py-2.5 px-3">Bài Hát / Chủ Đề</th>
                  <th className="py-2.5 px-3 text-right">Cột Nước</th>
                  <th className="py-2.5 px-3 text-right">Âm Lượng</th>
                  <th className="py-2.5 px-3 text-right">Điểm</th>
                  <th className="py-2.5 px-3">Voucher Đã Rinh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {entries.map((entry, idx) => {
                  const isTop1 = idx === 0;
                  const isTop2 = idx === 1;
                  const isTop3 = idx === 2;
                  const isCurrent = entry.playerName.toLowerCase() === currentPlayerName.toLowerCase();

                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-cyan-950/30 hover:bg-cyan-950/40'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-3">
                        {isTop1 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center font-mono">
                            1
                          </span>
                        ) : isTop2 ? (
                          <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-bold flex items-center justify-center font-mono">
                            2
                          </span>
                        ) : isTop3 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-bold flex items-center justify-center font-mono">
                            3
                          </span>
                        ) : (
                          <span className="font-mono text-slate-400 pl-1.5">{idx + 1}</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-white flex items-center gap-1.5 font-display">
                          <span>{entry.playerName}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded">
                              Bạn
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{entry.date}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-slate-200 font-medium truncate max-w-[180px]">{entry.songTitle}</div>
                        <div className="text-[11px] text-slate-400">{entry.themeName}</div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-bold text-cyan-400 tabular-nums">
                          {entry.heightMeters.toFixed(1)}m
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="font-mono text-amber-300 tabular-nums">
                          {entry.peakDb.toFixed(1)} dB
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-black text-white tabular-nums">
                          {entry.score}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-emerald-400 font-semibold truncate max-w-[160px]">
                          <Ticket className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{entry.voucherEarned}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Hát đạt từ <strong className="text-cyan-400">80m trở lên</strong> để ghi tên vào Top 3 danh giá
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
