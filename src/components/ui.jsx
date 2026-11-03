import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { digits, groupDigits } from '../lib/format.js';

export const Card = ({ className = '', children, ...props }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm shadow-black/[0.03] border border-gray-100 ${className}`} {...props}>
    {children}
  </div>
);

export const PrimaryButton = ({ className = '', children, ...props }) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold min-h-[36px] px-4 py-2 disabled:bg-blue-300 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const GhostButton = ({ className = '', children, ...props }) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 text-sm font-semibold min-h-[36px] px-4 py-2 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const PageTitle = ({ title, subtitle, right }) => (
  <div className="flex items-start justify-between gap-4 mb-6 lg:mb-8">
    <div className="min-w-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
    {right}
  </div>
);

export const Empty = ({ children, className = '' }) => <p className={`text-sm text-gray-500 text-center py-6 ${className}`}>{children}</p>;

export const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-2">
    {children}
  </label>
);

export const inputClass = 'w-full min-h-[46px] rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

export const MoneyInput = ({ value, onChange, id, placeholder = '0', autoFocus = false, large = false }) => (
  <div className={`flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 ${large ? 'min-h-[60px]' : 'min-h-[46px]'}`}>
    <span className={`${large ? 'text-lg' : 'text-sm'} font-semibold text-gray-500`}>Rp</span>
    <input
      id={id}
      inputMode="numeric"
      autoFocus={autoFocus}
      className={`w-full min-w-0 bg-transparent focus:outline-none text-gray-900 placeholder:text-gray-400 ${large ? 'text-2xl font-bold' : 'text-sm'}`}
      placeholder={placeholder}
      value={groupDigits(value)}
      onChange={(e) => onChange(digits(e.target.value))}
    />
  </div>
);

export const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-blue-700' : 'bg-gray-300'}`}
  >
    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
  </button>
);

export const Segmented = ({ options, value, onChange, className = '' }) => (
  <div className={`grid rounded-xl bg-gray-100 p-1 ${className}`} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="tablist">
    {options.map(([key, label]) => (
      <button
        type="button"
        role="tab"
        aria-selected={value === key}
        key={key}
        onClick={() => onChange(key)}
        className={`min-h-[40px] rounded-lg text-sm font-medium transition-colors ${value === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
      >
        {label}
      </button>
    ))}
  </div>
);

export const Tabs = ({ options, value, onChange }) => (
  <div className="grid grid-cols-2 border-b border-gray-100 mb-5" role="tablist">
    {options.map(([key, label]) => (
      <button
        type="button"
        role="tab"
        aria-selected={value === key}
        key={key}
        onClick={() => onChange(key)}
        className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${value === key ? 'text-blue-500 border-blue-500' : 'text-gray-500 border-transparent hover:text-gray-800'}`}
      >
        {label}
      </button>
    ))}
  </div>
);

/** A small pill that opens a list of choices. */
export const Dropdown = ({ value, options, onChange, label, align = 'right', className = '' }) => {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  const current = options.find(([key]) => key === value);
  return (
    <div className={`relative ${className}`} ref={box}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 min-h-[32px] rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
      >
        {current ? current[1] : label}
        <ChevronDown className="h-3 w-3 text-gray-400" />
      </button>
      {open && (
        <ul role="listbox" className={`absolute z-20 mt-1 max-h-64 min-w-[170px] overflow-auto rounded-xl border border-gray-100 bg-white py-1 shadow-lg ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {options.map(([key, text]) => (
            <li key={key} role="option" aria-selected={key === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-50 ${key === value ? 'font-semibold text-blue-700' : 'text-gray-700'}`}
              >
                {text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/** The panel that slides in from the right for forms. */
export const Drawer = ({ title, onClose, children, footer, width = 'md:w-[448px]' }) => {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fade-in absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`drawer-in absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-2xl ${width}`}>
        <div className="flex h-[69px] shrink-0 items-center justify-between border-b border-gray-100 px-6">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 -mr-2">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="shrink-0 border-t border-gray-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
};

export const Modal = ({ title, onClose, children, width = 'max-w-md' }) => {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fade-in absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`fade-in relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ${width}`}>{children}</div>
    </div>
  );
};

export const Confirm = ({ title, text, confirmLabel = 'Hapus', onCancel, onConfirm }) => (
  <Modal title={title} onClose={onCancel}>
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    <div className="mt-6 flex justify-end gap-3">
      <GhostButton onClick={onCancel}>Batal</GhostButton>
      <button type="button" onClick={onConfirm} className="min-h-[36px] rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
        {confirmLabel}
      </button>
    </div>
  </Modal>
);

export const WalletAvatar = ({ wallet, size = 'h-10 w-10 text-sm' }) => (
  <span className={`${size} shrink-0 rounded-full flex items-center justify-center font-bold text-white`} style={{ background: wallet?.color || '#0288d1' }} aria-hidden="true">
    {(wallet?.name || '?').slice(0, 1).toUpperCase()}
  </span>
);

export const CategoryIcon = ({ icon, size = 'h-10 w-10 text-lg' }) => (
  <span className={`${size} shrink-0 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center`} aria-hidden="true">
    {icon}
  </span>
);
