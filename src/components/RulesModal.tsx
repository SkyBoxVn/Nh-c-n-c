import React from 'react';
import { X, HelpCircle, Trophy, Zap, Volume2, Sparkles, Gift } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartShow: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, onStartShow }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Luật Chơi & Cơ Cấu Giải Thưởng</h2>
              <p className="text-xs text-slate-400">Cách thức biểu diễn và rinh voucher nhà hàng giá trị</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Rule 1: Hát càng to nước phun càng cao */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">1. Hát Càng To — Cột Nước Phun Càng Cao</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hệ thống microphone phân tích thời gian thực năng lượng thanh âm của bạn theo decibel (dB) và cao độ.
                Âm lượng càng lớn và hơi thở càng bền, máy bơm áp lực thủy lực càng đẩy cột nước trung tâm vút cao từ 8 mét lên tới đỉnh cực đại 100 mét!
              </p>
            </div>
          </div>

          {/* Rule 2: Chiếu Laser Tên Người Chơi */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">2. Chiếu Sáng Laser Tên Người Chơi Lên Màn Nước</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                4 tháp pháo laser bên bờ hồ đồng loạt chiếu chùm tia hội tụ vào màn sương nước mờ ảo, quét sáng rực rỡ họ và tên của bạn.
                Khi bạn ngân cao trào, hiệu ứng hào quang laser hologram sẽ bùng nổ theo nhịp điệu bài hát!
              </p>
            </div>
          </div>

          {/* Rule 3: Cơ Cấu Phần Thưởng Voucher Nhà Hàng */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-amber-500/30 flex gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Gift className="w-5 h-5" />
            </div>
            <div className="w-full">
              <h3 className="text-sm font-bold text-amber-300 mb-2">3. Bảng Giải Thưởng Voucher Các Nhà Hàng</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">🥇 Hạng Nhất (Cột nước &gt; 80m):</span>
                    <span className="text-slate-200">Haidilao Hotpot Buffet</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">1.000.000 VNĐ</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-300">🥈 Hạng Nhì (Cột nước &gt; 60m):</span>
                    <span className="text-slate-200">Golden Gate (Gogi, Manwah, Kichi)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">500.000 VNĐ</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-700">🥉 Hạng Ba (Cột nước &gt; 40m):</span>
                    <span className="text-slate-200">Pizza 4P's Gourmet</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">300.000 VNĐ</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">🎁 Khuyến Khích (&lt; 40m):</span>
                    <span className="text-slate-200">Buffet Topokki Dookki / Phúc Long</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">100.000 - 200.000 VNĐ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onClose();
              onStartShow();
            }}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tham Gia Biểu Diễn Ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
