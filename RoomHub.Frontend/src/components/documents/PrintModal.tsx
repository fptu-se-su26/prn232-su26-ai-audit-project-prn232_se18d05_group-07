import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * Full-screen overlay that shows a printable document. The toolbar is marked
 * `.print-hide` and the document wrapper `.print-root`, so window.print()
 * (driven by the global @media print rules) outputs only the document.
 */
const PrintModal: React.FC<Props> = ({ open, onClose, title = 'Tài liệu điện tử', children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-700/60 backdrop-blur-sm overflow-auto flex flex-col items-center py-6 px-4">
      <div className="print-hide w-full max-w-3xl flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">description</span> {title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">print</span> In / Lưu PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>

      <div className="print-root w-full max-w-3xl bg-white shadow-2xl rounded-sm">
        {children}
      </div>
    </div>
  );
};

export default PrintModal;
