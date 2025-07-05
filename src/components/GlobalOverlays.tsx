import { useCanvasStore } from '../store';

export default function GlobalOverlays() {
  const loading = useCanvasStore((s) => s.loading);
  const error = useCanvasStore((s) => s.error);
  const clearError = useCanvasStore((s) => s.setError);

  return (
    <>
      {loading && (
        <div className="loading-overlay">Loading…</div>
      )}
      {error && (
        <div className="error-banner" onClick={() => clearError()}>{error}</div>
      )}
    </>
  );
}