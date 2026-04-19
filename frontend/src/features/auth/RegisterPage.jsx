import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', school: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    try {
      const { user, accessToken } = await authApi.register(form);
      setAuth(user, accessToken);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display text-[var(--color-primary-500)]">Mi2ente</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Crea tu cuenta</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-md)] border border-[var(--color-border)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Nombre completo" value={form.name} onChange={set('name')} required placeholder="Antonia Pérez" />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} required placeholder="tu@email.com" />
            <Input label="Contraseña" type="password" value={form.password} onChange={set('password')} required placeholder="Mínimo 6 caracteres" />
            <Input label="Colegio (opcional)" value={form.school} onChange={set('school')} placeholder="Nombre del colegio" />
            <Button type="submit" loading={loading} className="w-full mt-2">Crear cuenta</Button>
          </form>
          <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-[var(--color-primary-500)] hover:underline font-medium">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
