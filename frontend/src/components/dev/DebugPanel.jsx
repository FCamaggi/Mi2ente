import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { debugApi } from '../../api/debug.api';

function BugIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2l1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/>
      <path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/>
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

function SeedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12"/><path d="M17 6l-5 6-5-6"/>
      <path d="M5 2h14a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
    </svg>
  );
}

export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null); // 'seed' | 'reset' | null
  const [lastResult, setLastResult] = useState(null);
  const qc = useQueryClient();

  async function handleSeed() {
    setLoading('seed');
    setLastResult(null);
    try {
      const { data } = await debugApi.seed();
      const { summary } = data.data;
      setLastResult({ ok: true, text: `✓ ${summary.courses} cursos · ${summary.students} alumnos · ${summary.evaluations} evaluaciones · ${summary.grades} notas` });
      toast.success('Datos de prueba creados');
      qc.invalidateQueries({ queryKey: ['courses'] });
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al seedear';
      setLastResult({ ok: false, text: msg });
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  }

  async function handleReset() {
    setLoading('reset');
    setLastResult(null);
    try {
      const { data } = await debugApi.reset();
      setLastResult({ ok: true, text: data.data.message });
      toast.success(data.data.message);
      qc.invalidateQueries({ queryKey: ['courses'] });
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al eliminar';
      setLastResult({ ok: false, text: msg });
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2">
      {/* Panel */}
      {open && (
        <div
          className="rounded-xl shadow-2xl border text-sm w-72"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b rounded-t-xl"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}
          >
            <span className="font-semibold flex items-center gap-2">
              <BugIcon />
              Debug Panel
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-mono font-bold"
              style={{ background: '#fef08a', color: '#713f12' }}
            >
              DEV
            </span>
          </div>

          {/* Body */}
          <div className="p-4 flex flex-col gap-3">
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-xs">
              Genera cursos, alumnos, evaluaciones y notas de prueba asociados a tu cuenta.
            </p>

            <button
              onClick={handleSeed}
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
              style={{ background: 'var(--color-primary-500)', color: '#fff' }}
            >
              {loading === 'seed' ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : <SeedIcon />}
              Seedear datos de prueba
            </button>

            <button
              onClick={handleReset}
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              {loading === 'reset' ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : <TrashIcon />}
              Eliminar datos seed
            </button>

            {/* Result */}
            {lastResult && (
              <div
                className="flex items-start gap-2 text-xs rounded-lg px-3 py-2"
                style={{
                  background: lastResult.ok ? '#dcfce7' : '#fee2e2',
                  color: lastResult.ok ? '#166534' : '#991b1b',
                }}
              >
                {lastResult.ok && <CheckIcon />}
                <span>{lastResult.text}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Debug Panel"
        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
        style={{
          background: open ? 'var(--color-primary-600)' : 'var(--color-primary-500)',
          color: '#fff',
        }}
      >
        <BugIcon />
      </button>
    </div>
  );
}
