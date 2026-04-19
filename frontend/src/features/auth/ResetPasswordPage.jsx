import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, form.password);
      setDone(true);
      toast.success('Contraseña actualizada');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'No se pudo restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="w-full max-w-sm">
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-md)] border border-[var(--color-border)]">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">Restablecer contraseña</h2>
          {done ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">OK</div>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Tu contraseña fue actualizada. Redirigiendo al login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              <Input
                label="Nueva contraseña"
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
                placeholder="Mínimo 6 caracteres"
              />
              <Input
                label="Confirmar contraseña"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                required
                placeholder="Repite tu contraseña"
              />
              <Button type="submit" loading={loading} className="w-full">
                Guardar nueva contraseña
              </Button>
            </form>
          )}
          <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
            <Link to="/login" className="text-[var(--color-primary-500)] hover:underline">Volver al login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
