import { Component } from 'react';

const RESET = () => {
  try { localStorage.removeItem('uangku.state.v1'); } catch { /* ignore */ }
  window.location.href = '/';
};

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep the detail in the console for local debugging; nothing is sent anywhere.
    console.error('uangku error', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">Ada yang tidak beres</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Layar ini gagal dimuat. Catatanmu tetap tersimpan di browser. Coba muat ulang dulu; kalau masih gagal, unduh backup lewat data mentah di bawah.
          </p>
          <p className="mt-3 break-words rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">{String(this.state.error?.message || this.state.error)}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => window.location.reload()} className="min-h-[40px] rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800">Muat ulang</button>
            <button type="button" onClick={RESET} className="min-h-[40px] rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-600 hover:bg-red-50">Hapus data & mulai ulang</button>
          </div>
          <p className="mt-4 text-xs leading-5 text-gray-500">Sebelum menghapus, coba buka DevTools → Application → Local Storage → <code>uangku.state.v1</code> dan simpan isinya.</p>
        </div>
      </div>
    );
  }
}
