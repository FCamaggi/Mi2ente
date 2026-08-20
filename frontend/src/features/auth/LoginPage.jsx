import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { setTheme } = useThemeStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const defaultUrl = import.meta.env.VITE_API_URL || 'https://mi2ente-api.onrender.com/api';
  const vercelUrl = import.meta.env.VITE_VERCEL_API_URL || 'https://mi2ente-api.vercel.app/api';
  const [selectedBackend, setSelectedBackend] = useState(
    localStorage.getItem('api_backend_url') || defaultUrl
  );

  const handleBackendChange = (e) => {
    const url = e.target.value;
    setSelectedBackend(url);
    localStorage.setItem('api_backend_url', url);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user, accessToken } = await authApi.login(form);
      setAuth(user, accessToken);
      if (user.theme) setTheme(user.theme);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-4">
          <select
            value={selectedBackend}
            onChange={handleBackendChange}
            className="text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-2 py-1 text-[var(--color-text-secondary)] w-full mb-4"
          >
            <option value={defaultUrl}>Servidor Principal (Render)</option>
            <option value={vercelUrl}>Servidor de Respaldo (Vercel)</option>
          </select>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display text-[var(--color-primary-500)]">Mi2ente</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Gestión de notas para docentes</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-md)] border border-[var(--color-border)]">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">Iniciar sesión</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required placeholder="tu@email.com" />
            <Input label="Contraseña" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required placeholder="••••••••" />
            <Link to="/forgot-password" className="text-xs text-[var(--color-primary-500)] hover:underline text-right -mt-2">¿Olvidaste tu contraseña?</Link>
            <Button type="submit" loading={loading} className="w-full mt-2">Entrar</Button>
          </form>
          <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-[var(--color-primary-500)] hover:underline font-medium">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
