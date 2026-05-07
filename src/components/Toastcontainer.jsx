import { useApp } from '../context/AppContext';

const icons = {
  success: '✓', info: 'ℹ', warn: '⚠', error: '✕',
};
const styles = {
  success: 'bg-green-50 border-green-200 text-green-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
  warn: 'bg-amber-50 border-amber-200 text-amber-700',
  error: 'bg-red-50 border-red-200 text-red-700',
};

export default function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div className="fixed top-16 right-4 z-[999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`slide-in flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm font-medium min-w-[220px] shadow-md ${styles[t.type] || styles.info}`}>
          <span>{icons[t.type] || icons.info}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}