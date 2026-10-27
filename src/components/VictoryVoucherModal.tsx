import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RestaurantVoucher, SingingPerformance } from '../types';
import {
  Trophy,
  Copy,
  Check,
  QrCode,
  Calendar,
  MapPin,
  Sparkles,
  Share2,
  BookmarkCheck,
  RefreshCw,
  Flame,
  Volume2
} from 'lucide-react';

interface VictoryVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  performance: SingingPerformance;
  voucher: RestaurantVoucher;
  onSaveToWallet: (voucher: RestaurantVoucher) => void;
  onPlayAgain: () => void;
}

export const VictoryVoucherModal: React.FC<VictoryVoucherModalProps> = ({
  isOpen,
  onClose,
  performance,
  voucher,
  onSaveToWallet,
  onPlayAgain,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fire victory confetti cannons
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#ffffff'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 300);
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    onSaveToWallet(voucher);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Banner with Restaurant Feast Image & Victory Badge */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
          <img
            src="/src/assets/images/restaurant_voucher_rewards_1793121572044.jpg"
            alt="Đại tiệc ẩm thực nhà hàng"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          {/* Victory Floating Crest */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/30">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                  <Trophy className="w-7 h-7" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    {performance.rankTitle}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-xs text-slate-300">Biểu Diễn Nhạc Nước Xuất Sắc</span>
                </div>
                <h2 className="text-2xl font-black text-white font-display tracking-wide drop-shadow-md">
                  CHÚC MỪNG CHIẾN THẮNG!
                </h2>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Điểm Thành Tích</div>
              <div className="text-2xl font-black text-amber-300 font-mono tabular-nums">
                {performance.score}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Laser Water Projection Snapshot Card */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-2xl p-4 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tên Đã Chiếu Sáng Bằng Laser Lên Màn Nước</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white font-display tracking-wider mt-1 text-cyan-200">
                  {performance.playerName.toUpperCase()}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Bài hát: <span className="text-slate-200 font-medium">{performance.songTitle}</span>
                </div>
              </div>

              {/* Metric Highlights */}
              <div className="flex items-center gap-4 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 shrink-0">
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Cột Nước Max</div>
                  <div className="flex items-center gap-1 text-lg font-black text-cyan-400 font-mono tabular-nums">
                    <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>{performance.maxHeightMeters.toFixed(1)}m</span>
                  </div>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Âm Lượng Đỉnh</div>
                  <div className="flex items-center gap-1 text-lg font-black text-amber-300 font-mono tabular-nums">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>{performance.peakDb} dB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Awarded Restaurant Voucher Card */}
          <div className="bg-slate-950 rounded-2xl border-2 border-dashed border-amber-500/60 p-5 space-y-4 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{voucher.brandLogo}</span>
                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">{voucher.brand}</div>
                  <h3 className="text-base font-bold text-white">{voucher.title}</h3>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Giá Trị Voucher</div>
                <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums">
                  {voucher.discountValue}
                </div>
              </div>
            </div>

            {/* Voucher Promo Code & QR Code display */}
            <div className="grid sm:grid-cols-3 gap-4 items-center bg-slate-900/90 p-4 rounded-xl border border-slate-800">
              <div className="sm:col-span-2 space-y-2">
                <div className="text-xs text-slate-400 font-mono uppercase">Mã Khuyến Mãi (Xuất trình khi thanh toán):</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono text-lg font-bold text-white tracking-widest bg-slate-950 px-3 py-2 rounded-lg border border-slate-700">
                    {voucher.code}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Đã Chép' : 'Sao Chép'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Hạn dùng: <strong className="text-slate-300">{voucher.expiryDate}</strong></span>
                  </div>
                  <div>
                    <span>Áp dụng: <strong className="text-slate-300">{voucher.minSpend}</strong></span>
                  </div>
                </div>
              </div>

              {/* QR Code image */}
              <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl shadow-md shrink-0 mx-auto sm:mx-0">
                <img
                  src={voucher.qrCodeUrl}
                  alt={`QR ${voucher.code}`}
                  className="w-24 h-24 object-contain"
                />
                <span className="text-[9px] font-mono font-bold text-slate-700 mt-1">QUÉT MÃ TẠI QUẦY</span>
              </div>
            </div>

            {/* Terms of Use */}
            <div className="space-y-1 text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1 text-slate-300 font-semibold mb-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Địa điểm áp dụng: {voucher.applicableLocations}</span>
              </div>
              {voucher.terms.map((term, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px]">
                  <span className="text-amber-400">·</span>
                  <span>{term}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSave}
              className={`flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                saved
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-400" />
              <span>{saved ? 'Đã Lưu Vào Ví' : 'Lưu Vào Ví Voucher'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                onClose();
                onPlayAgain();
              }}
              className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-xl shadow-lg shadow-amber-400/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Hát Tiếp & Phá Kỷ Lục</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
