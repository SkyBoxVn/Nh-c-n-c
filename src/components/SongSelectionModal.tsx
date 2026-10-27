import React, { useState } from 'react';
import { SongTrack } from '../types';
import { SONG_TRACKS } from '../data/themesAndSongs';
import { X, Play, Music, User, Disc3, Sparkles } from 'lucide-react';

interface SongSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSong: SongTrack;
  onSelectSong: (song: SongTrack) => void;
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  onStartShow: () => void;
}

export const SongSelectionModal: React.FC<SongSelectionModalProps> = ({
  isOpen,
  onClose,
  selectedSong,
  onSelectSong,
  playerName,
  onUpdatePlayerName,
  onStartShow,
}) => {
  const [tempName, setTempName] = useState(playerName);

  if (!isOpen) return null;

  const handleConfirmAndStart = (song: SongTrack) => {
    if (tempName.trim()) {
      onUpdatePlayerName(tempName.trim());
    }
    onSelectSong(song);
    onClose();
    onStartShow();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Chọn Bài Hát & Tên Chiếu Laser</h2>
              <p className="text-xs text-slate-400">Tên của bạn sẽ được pháo laser quét sáng rực rỡ trên màn nước 100m</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Player Name Input */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-cyan-500/30 space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <User className="w-4 h-4" />
              <span>Họ và Tên Người Chơi (Chiếu Laser lên Màn Nước)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Ví dụ: NGUYỄN VĂN AN hoặc TRẦN MAI ANH"
                className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-display"
                maxLength={30}
              />
              <button
                type="button"
                onClick={() => {
                  if (tempName.trim()) {
                    onUpdatePlayerName(tempName.trim());
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                Cập Nhật
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Laser sẽ quét tên bạn liên tục cùng hiệu ứng hào quang phản chiếu trên các hạt nước.
            </p>
          </div>

          {/* Song Track List */}
          <div className="space-y-2.5">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Danh Sách Bài Hát Nhạc Nước Theo Chủ Đề:
            </div>

            <div className="grid gap-2.5">
              {SONG_TRACKS.map((track) => {
                const isSelected = selectedSong.id === track.id;
                return (
                  <div
                    key={track.id}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-400 ring-1 ring-cyan-500/40 shadow-lg'
                        : 'bg-slate-950/50 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                    onClick={() => onSelectSong(track)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Disc3 className={`w-5 h-5 ${isSelected ? 'animate-spin' : ''}`} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white font-display">{track.title}</h4>
                          {isSelected && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {track.artist} · <span className="text-slate-300 font-medium">{track.genre}</span> · {track.bpm} BPM
                        </div>
                        <p className="text-xs text-slate-400/90 mt-1 line-clamp-1">{track.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmAndStart(track);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg flex items-center gap-1.5 shadow-md shadow-amber-400/20 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Biểu Diễn Ngay</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Hát càng to, nhạc nước càng vút cao, cơ hội nhận Voucher 1.000.000đ</span>
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
