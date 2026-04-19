import { useState } from 'react';
import toast from 'react-hot-toast';
import { usersApi } from '../../api/users.api';
import { useAuthStore } from '../../store/authStore';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

function SectionCard({ title, description, children, onSubmit, loading, buttonLabel = 'Guardar' }) {
  return (
    <section
      className="rounded-[var(--radius-lg)] border p-6 mb-5"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <h2 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
      {description && (
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {children}
        <div className="flex justify-end pt-1">
          <Button type="submit" loading={loading}>{buttonLabel}</Button>
        </div>
      </form>
    </section>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5 shrink-0">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <div
          className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-[var(--color-primary-500)]' : 'bg-[var(--color-border)]'}`}
        />
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`}
        />
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>}
      </div>
    </label>
  );
}

export function SettingsPage() {
  const { user, updateUser } = useAuthStore();

  // ── 1. Grade config ──────────────────────────────────────────────────────
  const initialGrade = user?.gradeConfig || { minGrade: 1, maxGrade: 7, passGrade: 4, decimals: 1 };
  const [gradeConfig, setGradeConfig] = useState({
    minGrade:  initialGrade.minGrade  ?? 1,
    maxGrade:  initialGrade.maxGrade  ?? 7,
    passGrade: initialGrade.passGrade ?? 4,
    decimals:  initialGrade.decimals  ?? 1,
  });
  const [gradeLoading, setGradeLoading] = useState(false);

  const setGradeField = (field) => (e) => {
    const v = field === 'decimals' ? parseInt(e.target.value, 10) : parseFloat(e.target.value);
    setGradeConfig(p => ({ ...p, [field]: v }));
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (gradeConfig.minGrade >= gradeConfig.maxGrade) { toast.error('La nota mínima debe ser menor a la máxima'); return; }
    if (gradeConfig.passGrade < gradeConfig.minGrade || gradeConfig.passGrade > gradeConfig.maxGrade) {
      toast.error('La nota de aprobación debe quedar dentro del rango'); return;
    }
    setGradeLoading(true);
    try {
      await usersApi.updateMe({ gradeConfig });
      updateUser({ gradeConfig });
      toast.success('Configuración de notas guardada');
    } catch { toast.error('No se pudo guardar'); }
    finally { setGradeLoading(false); }
  };

  // ── 2. Preferences ───────────────────────────────────────────────────────
  const initialPrefs = user?.preferences || {};
  const [prefs, setPrefs] = useState({
    studentSortOrder:    initialPrefs.studentSortOrder    || 'listNumber',
    defaultEvalType:     initialPrefs.defaultEvalType     || 'prueba',
    showGradeColors:     initialPrefs.showGradeColors     ?? true,
    exportFormat:        initialPrefs.exportFormat        || 'excel',
    defaultAcademicYear: initialPrefs.defaultAcademicYear || new Date().getFullYear(),
  });
  const [prefsLoading, setPrefsLoading] = useState(false);

  const setPref = (field) => (e) => setPrefs(p => ({ ...p, [field]: e.target.value }));
  const setPrefBool = (field) => (e) => setPrefs(p => ({ ...p, [field]: e.target.checked }));
  const setPrefInt  = (field) => (e) => setPrefs(p => ({ ...p, [field]: parseInt(e.target.value, 10) }));

  const handlePrefsSubmit = async (e) => {
    e.preventDefault();
    setPrefsLoading(true);
    try {
      await usersApi.updateMe({ preferences: prefs });
      updateUser({ preferences: prefs });
      toast.success('Preferencias guardadas');
    } catch { toast.error('No se pudo guardar'); }
    finally { setPrefsLoading(false); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold font-display mb-1" style={{ color: 'var(--color-text-primary)' }}>
        Configuración
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        Valores globales por defecto. Cada curso puede tener su propia escala de notas que prevalece sobre estos.
      </p>

      {/* ── 1. Escala de notas ── */}
      <SectionCard
        title="Escala global de notas"
        description="Se aplica a todos los cursos que no tienen escala propia definida."
        onSubmit={handleGradeSubmit}
        loading={gradeLoading}
      >
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nota mínima" type="number" step="0.1" min="1" max="7" value={gradeConfig.minGrade} onChange={setGradeField('minGrade')} />
          <Input label="Nota máxima" type="number" step="0.1" min="1" max="7" value={gradeConfig.maxGrade} onChange={setGradeField('maxGrade')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nota de aprobación" type="number" step="0.1" min="1" max="7" value={gradeConfig.passGrade} onChange={setGradeField('passGrade')} />
          <Select label="Decimales en promedios" value={gradeConfig.decimals} onChange={setGradeField('decimals')}>
            <option value={0}>Sin decimales (ej. 5)</option>
            <option value={1}>1 decimal (ej. 5.3)</option>
            <option value={2}>2 decimales (ej. 5.33)</option>
          </Select>
        </div>

        {/* Live preview */}
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
          Vista previa: nota <strong style={{ color: 'var(--color-text-primary)' }}>{gradeConfig.passGrade.toFixed(gradeConfig.decimals)}</strong> aprueba &nbsp;·&nbsp;
          escala <strong style={{ color: 'var(--color-text-primary)' }}>{gradeConfig.minGrade} – {gradeConfig.maxGrade}</strong>
        </div>
      </SectionCard>

      {/* ── 2. Visualización ── */}
      <SectionCard
        title="Visualización"
        description="Cómo se muestran los datos en el libro de notas."
        onSubmit={handlePrefsSubmit}
        loading={prefsLoading}
      >
        <Select label="Orden de alumnos en el libro de notas" value={prefs.studentSortOrder} onChange={setPref('studentSortOrder')}>
          <option value="listNumber">Por número de lista</option>
          <option value="lastName">Por apellido (A–Z)</option>
        </Select>
        <Toggle
          label="Colorear celdas de notas"
          description="Fondo verde para notas aprobadas, rojo para reprobadas."
          checked={prefs.showGradeColors}
          onChange={setPrefBool('showGradeColors')}
        />
      </SectionCard>

      {/* ── 3. Evaluaciones ── */}
      <SectionCard
        title="Evaluaciones"
        description="Valores predeterminados al crear nuevas evaluaciones."
        onSubmit={handlePrefsSubmit}
        loading={prefsLoading}
      >
        <Select label="Tipo de evaluación por defecto" value={prefs.defaultEvalType} onChange={setPref('defaultEvalType')}>
          <option value="prueba">Prueba</option>
          <option value="tarea">Tarea</option>
          <option value="trabajo">Trabajo</option>
          <option value="disertacion">Disertación</option>
          <option value="otro">Otro</option>
        </Select>
      </SectionCard>

      {/* ── 4. Exportación y año académico ── */}
      <SectionCard
        title="Exportación y año académico"
        description="Configuración para exportar datos y año por defecto de nuevos cursos."
        onSubmit={handlePrefsSubmit}
        loading={prefsLoading}
      >
        <div className="grid grid-cols-2 gap-3">
          <Select label="Formato de exportación por defecto" value={prefs.exportFormat} onChange={setPref('exportFormat')}>
            <option value="excel">Excel (.xlsx)</option>
            <option value="pdf">PDF</option>
          </Select>
          <Input
            label="Año académico por defecto"
            type="number" min="2000" max="2099"
            value={prefs.defaultAcademicYear}
            onChange={setPrefInt('defaultAcademicYear')}
          />
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          El año académico se puede cambiar individualmente en cada curso.
        </p>
      </SectionCard>
    </div>
  );
}
