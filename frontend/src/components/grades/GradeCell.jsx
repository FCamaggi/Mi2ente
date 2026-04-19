import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const STATUS_OPTIONS = [
  { value: 'graded',  label: 'Calificada' },
  { value: 'absent',  label: 'Ausente' },
  { value: 'exempt',  label: 'Exento/a' },
  { value: 'pending', label: 'Pendiente' },
];

export function GradeCell({
  value,
  status,
  passGrade = 4.0,
  onSave,
  onNavigate,
  studentId,
  evaluationId
}) {
  const [editing, setEditing]         = useState(false);
  const [draftValue, setDraftValue]   = useState('');
  const [draftStatus, setDraftStatus] = useState(status || 'pending');
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [cellRect, setCellRect]       = useState(null);

  const tdRef      = useRef(null);
  const inputRef   = useRef(null);
  const popoverRef = useRef(null);

  useEffect(() => { setDraftStatus(status || 'pending'); }, [status]);

  // Keep popover position synced when the table scrolls
  useEffect(() => {
    if (!editing) return;
    const update = () => setCellRect(tdRef.current?.getBoundingClientRect());
    document.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      document.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [editing]);

  const isNumeric    = status === 'graded' && value != null;
  const displayValue = status === 'absent' ? 'Aus'
    : status === 'exempt'  ? 'Exen'
    : isNumeric            ? value.toFixed(1)
    : '—';

  const bgClass = () => {
    if (status === 'absent' || status === 'exempt') return 'bg-[var(--color-surface-2)]';
    if (!isNumeric) return '';
    return value >= passGrade ? 'bg-[var(--color-grade-ok)]' : 'bg-[var(--color-grade-fail)]';
  };

  const textClass = () => {
    if (!isNumeric) return 'text-[var(--color-text-secondary)]';
    return value >= passGrade ? 'text-[var(--color-grade-ok-text)]' : 'text-[var(--color-grade-fail-text)]';
  };

  const enterEdit = () => {
    setCellRect(tdRef.current?.getBoundingClientRect());
    setDraftValue(value != null ? String(value) : '');
    setDraftStatus(status || 'pending');
    setEditing(true);
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 0);
  };

  const move = (direction) => onNavigate?.({ studentId, evaluationId, direction });

  const commitEdit = useCallback(async (direction = 'none') => {
    setEditing(false);
    const s = draftStatus || 'pending';
    let payload;

    if (s === 'graded') {
      const trimmed = draftValue.trim();
      if (!trimmed) { move(direction); return; }
      const parsed = parseFloat(trimmed.replace(',', '.'));
      if (Number.isNaN(parsed) || parsed < 1 || parsed > 7) { move(direction); return; }
      payload = { value: parsed, status: 'graded' };
      if (parsed === value && status === 'graded') { move(direction); return; }
    } else if (s === 'absent' || s === 'exempt') {
      payload = { value: null, status: s };
      if (s === status && value === null) { move(direction); return; }
    } else {
      payload = { value: null, status: 'pending' };
      if ((status || 'pending') === 'pending' && value === null) { move(direction); return; }
    }

    setSaving(true);
    try {
      await onSave(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 1000);
    } catch { /* toast handled upstream */ }
    finally { setSaving(false); move(direction); }
  }, [draftStatus, draftValue, value, status, onSave, move]);

  const handlePopoverBlur = (e) => {
    if (popoverRef.current?.contains(e.relatedTarget)) return;
    commitEdit('none');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter')           { e.preventDefault(); commitEdit('down'); }
    else if (e.key === 'Tab')        { e.preventDefault(); commitEdit(e.shiftKey ? 'left' : 'right'); }
    else if (e.key === 'Escape')     { setEditing(false); move('none'); }
    else if (e.key === 'ArrowDown')  { e.preventDefault(); commitEdit('down'); }
    else if (e.key === 'ArrowUp')    { e.preventDefault(); commitEdit('up'); }
    else if (e.key === 'ArrowLeft')  { e.preventDefault(); commitEdit('left'); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); commitEdit('right'); }
  };

  const handleStaticKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enterEdit(); }
    else if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
      e.preventDefault(); move(e.key.replace('Arrow','').toLowerCase());
    } else if (e.key === 'Tab') { e.preventDefault(); move(e.shiftKey ? 'left' : 'right'); }
  };

  const handleValueChange = (e) => {
    const v = e.target.value;
    setDraftValue(v);
    if (v && draftStatus !== 'graded') setDraftStatus('graded');
  };

  const handleStatusChange = (val) => {
    setDraftStatus(val);
    if (val !== 'graded') {
      setDraftValue('');
    } else {
      inputRef.current?.focus();
    }
  };

  // Compute popover position: prefer below, fall back to above
  const popoverStyle = (() => {
    if (!cellRect) return { display: 'none' };
    const popoverH = 80; // approximate height
    const spaceBelow = window.innerHeight - cellRect.bottom;
    const top = spaceBelow >= popoverH ? cellRect.bottom : cellRect.top - popoverH;
    // keep within horizontal viewport
    const maxLeft = window.innerWidth - 204;
    const left = Math.min(Math.max(0, cellRect.left), maxLeft);
    return { position: 'fixed', top, left, zIndex: 9999, minWidth: 200 };
  })();

  return (
    <>
      {/* The table cell — always same size */}
      <td
        ref={tdRef}
        data-student-id={studentId}
        data-evaluation-id={evaluationId}
        role="gridcell"
        aria-label={`Nota ${displayValue}`}
        className={[
          'text-center text-sm font-mono cursor-pointer select-none min-w-[84px] h-10 relative transition-colors',
          editing
            ? 'border-2 border-[var(--color-primary-500)]'
            : `border border-[var(--color-border)] hover:bg-[var(--color-row-hover)] ${bgClass()} ${textClass()}`
        ].join(' ')}
        onClick={() => { if (!editing) enterEdit(); }}
        onKeyDown={handleStaticKeyDown}
        tabIndex={editing ? -1 : 0}
      >
        {editing ? (
          // Show a muted placeholder in the cell while the popover is open
          <span className="text-xs" style={{ color: 'var(--color-primary-400)' }}>✎</span>
        ) : saving ? (
          <span style={{ color: 'var(--color-text-muted)' }}>...</span>
        ) : saved ? (
          <span style={{ color: 'var(--color-grade-ok-text)' }}>✓</span>
        ) : (
          displayValue
        )}
      </td>

      {/* Floating edit popover — rendered at document.body to avoid overflow clipping */}
      {editing && cellRect && createPortal(
        <div
          ref={popoverRef}
          style={{
            ...popoverStyle,
            background: 'var(--color-surface)',
            border: '2px solid var(--color-primary-500)',
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
          tabIndex={-1}
          onBlur={handlePopoverBlur}
          onKeyDown={handleKeyDown}
        >
          {/* Number input */}
          <input
            ref={inputRef}
            value={draftValue}
            onChange={handleValueChange}
            placeholder={draftStatus !== 'graded' ? '—' : '1.0 – 7.0'}
            inputMode="decimal"
            disabled={draftStatus === 'absent' || draftStatus === 'exempt'}
            aria-label="Valor de la nota"
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              textAlign: 'center',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-mono, monospace)',
              background: 'transparent',
              color: 'var(--color-text-primary)',
              border: 'none',
              outline: 'none',
              opacity: draftStatus === 'absent' || draftStatus === 'exempt' ? 0.4 : 1,
            }}
          />

          {/* Status buttons */}
          <div style={{ display: 'flex', borderTop: '1px solid var(--color-border)' }}>
            {STATUS_OPTIONS.map(({ value: val, label }) => (
              <button
                key={val}
                type="button"
                onMouseDown={(e) => e.preventDefault()} // keep focus on input
                onClick={() => handleStatusChange(val)}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  fontSize: '0.7rem',
                  fontWeight: draftStatus === val ? '700' : '400',
                  background: draftStatus === val ? 'var(--color-primary-500)' : 'transparent',
                  color: draftStatus === val ? '#fff' : 'var(--color-text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
