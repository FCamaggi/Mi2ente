import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { usersApi } from '../../api/users.api';
import { schoolsApi } from '../../api/schools.api';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore, THEMES } from '../../store/themeStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: user?.name || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [addingSchool, setAddingSchool] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState(null);
  const [editingSchoolName, setEditingSchoolName] = useState('');

  const { data: schools = [], isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: schoolsApi.list
  });

  const invalidateSchools = () => {
    queryClient.invalidateQueries({ queryKey: ['schools'] });
    queryClient.invalidateQueries({ queryKey: ['courses'] });
  };

  const handleAddSchool = async (e) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;
    try {
      await schoolsApi.create({ name: newSchoolName.trim() });
      setNewSchoolName('');
      setAddingSchool(false);
      invalidateSchools();
      toast.success('Colegio añadido');
    } catch { toast.error('Error al añadir colegio'); }
  };

  const handleToggleActive = async (school) => {
    try {
      await schoolsApi.update(school._id, { isActive: !school.isActive });
      invalidateSchools();
    } catch { toast.error('Error al actualizar colegio'); }
  };

  const handleDeleteSchool = async (school) => {
    try {
      await schoolsApi.remove(school._id);
      invalidateSchools();
      toast.success('Colegio eliminado');
    } catch { toast.error('Error al eliminar colegio'); }
  };

  const startEditSchool = (school) => {
    setEditingSchoolId(school._id);
    setEditingSchoolName(school.name);
  };

  const handleSaveSchoolName = async (schoolId) => {
    if (!editingSchoolName.trim()) return;
    try {
      await schoolsApi.update(schoolId, { name: editingSchoolName.trim() });
      setEditingSchoolId(null);
      invalidateSchools();
    } catch { toast.error('Error al guardar nombre'); }
  };

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await usersApi.updateMe(form);
      updateUser(form);
      toast.success('Perfil actualizado');
    } catch { toast.error('Error al actualizar'); }
    setSavingProfile(false);
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) { toast.error('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    setSavingPw(true);
    try {
      await usersApi.changePassword(pwForm);
      setPwForm({ currentPassword: '', newPassword: '' });
      toast.success('Contraseña actualizada');
    } catch (err) { toast.error(err.response?.data?.error?.message || 'Error al cambiar contraseña'); }
    setSavingPw(false);
  };

  const handleTheme = async (id) => {
    setTheme(id);
    try { await usersApi.updateMe({ theme: id }); } catch {}
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold font-display text-[var(--color-text-primary)] mb-6">Mi Perfil</h1>

      {/* Profile info */}
      <section className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 mb-6">
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Información personal</h2>
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
          <Input label="Nombre" value={form.name} onChange={set('name')} required />
          <Input label="Email" value={user?.email || ''} disabled className="opacity-60" />
          <Button type="submit" loading={savingProfile} className="self-end">Guardar cambios</Button>
        </form>
      </section>

      {/* Schools */}
      <section className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-[var(--color-text-primary)]">Mis colegios</h2>
          <Button size="sm" variant="secondary" onClick={() => setAddingSchool(v => !v)}>
            <Plus size={14} /> Añadir
          </Button>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Los colegios activos aparecen como opción al crear o editar un curso. Puedes archivar un colegio para ocultarlo sin perder sus datos.
        </p>

        {addingSchool && (
          <form onSubmit={handleAddSchool} className="flex gap-2 mb-4">
            <Input
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              placeholder="Nombre del colegio"
              className="flex-1"
              autoFocus
            />
            <Button type="submit" size="sm">Guardar</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => { setAddingSchool(false); setNewSchoolName(''); }}>
              <X size={14} />
            </Button>
          </form>
        )}

        {schoolsLoading ? (
          <p className="text-sm text-[var(--color-text-muted)]">Cargando colegios...</p>
        ) : schools.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">Aún no tienes colegios registrados. Añade uno para poder asignarlo a tus cursos.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {schools.map(school => (
              <li
                key={school._id}
                className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] border transition-colors ${school.isActive ? 'border-[var(--color-primary-300)] bg-[var(--color-primary-50)]' : 'border-[var(--color-border)] bg-[var(--color-surface-2)] opacity-60'}`}
              >
                {editingSchoolId === school._id ? (
                  <>
                    <input
                      value={editingSchoolName}
                      onChange={(e) => setEditingSchoolName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); handleSaveSchoolName(school._id); }
                        if (e.key === 'Escape') setEditingSchoolId(null);
                      }}
                      className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] outline-none border-b border-[var(--color-primary-500)]"
                      autoFocus
                    />
                    <button onClick={() => handleSaveSchoolName(school._id)} className="text-[var(--color-grade-ok-text)] hover:opacity-70 p-1">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditingSchoolId(null)} className="text-[var(--color-text-secondary)] hover:opacity-70 p-1">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-[var(--color-text-primary)] font-medium">{school.name}</span>
                    {school.isActive && (
                      <span className="text-xs text-[var(--color-primary-600)] font-semibold">Activo</span>
                    )}
                    <button onClick={() => startEditSchool(school)} className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" title="Renombrar">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleToggleActive(school)} className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-xs" title={school.isActive ? 'Archivar' : 'Activar'}>
                      {school.isActive ? 'Archivar' : 'Activar'}
                    </button>
                    <button onClick={() => handleDeleteSchool(school)} className="p-1 text-[var(--color-grade-fail-text)] hover:opacity-70 transition-colors" title="Eliminar">
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Theme */}
      <section className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 mb-6">
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Tema visual</h2>
        <div className="flex flex-wrap gap-2">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => handleTheme(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-sm border transition-all ${theme === t.id ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-600)] font-semibold' : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary-300)]'}`}
            >
              {t.emoji} {t.name}
            </button>
          ))}
        </div>
      </section>

      {/* Password */}
      <section className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6">
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Cambiar contraseña</h2>
        <form onSubmit={handlePwSubmit} className="flex flex-col gap-4">
          <Input label="Contraseña actual" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required />
          <Input label="Nueva contraseña" type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} required placeholder="Mínimo 6 caracteres" />
          <Button type="submit" loading={savingPw} className="self-end">Cambiar contraseña</Button>
        </form>
      </section>
    </div>
  );
}
