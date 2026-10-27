import React, { useState } from 'react';
import { RestaurantVoucher } from '../types';
import { X, Ticket, Copy, Check, Calendar, MapPin, ExternalLink, Sparkles } from 'lucide-react';

interface VoucherWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: RestaurantVoucher[];
  onStartSinging: () => void;
}

export const VoucherWalletModal: React.FC<VoucherWalletModalProps> = ({
  isOpen,
  onClose,
  vouchers,
  onStartSinging,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Ví Voucher Ẩm Thực Của Bạn</h2>
              <p className="text-xs text-slate-400">
                Phần thưởng từ những màn biểu diễn nhạc nước đạt chiều cao xuất sắc
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

        {/* List of Vouchers */}
        <div className="p-5 overflow-y-auto space-y-4">
          {vouchers.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Ticket className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-300">Bạn chưa có voucher nào</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Hãy tham gia biểu diễn ngay! Hát càng to, cột nước càng phun cao trên 50m để rinh ngay voucher các nhà hàng Haidilao, Golden Gate, Pizza 4P's...
              </p>
              <button
                onClick={() => {
                  onClose();
                  onStartSinging();
                }}
                className="mt-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bắt Đầu Hát & Nhận Thưởng</span>
              </button>
            </div>
          ) : (
            vouchers.map((voucher) => (
              <div
                key={voucher.id + voucher.code}
                className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-md hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{voucher.brandLogo}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{voucher.brand}</h4>
                      <div className="text-xs text-slate-400">{voucher.title}</div>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 self-start sm:self-auto">
                    <span className="text-lg font-black text-emerald-400 font-mono tabular-nums">
                      {voucher.discountValue}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Mã Voucher:</div>
                    <div className="font-mono text-base font-bold text-cyan-300 tracking-wider">
                      {voucher.code}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>Hạn sử dụng: {voucher.expiryDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleCopy(voucher.code)}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedCode === voucher.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép mã</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{voucher.applicableLocations}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Tổng cộng: <strong className="text-slate-200">{vouchers.length}</strong> voucher trong ví
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
