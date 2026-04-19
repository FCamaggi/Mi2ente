import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Error al enviar el email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="w-full max-w-sm">
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-md)] border border-[var(--color-border)]">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">Recuperar contraseña</h2>
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📧</div>
              <p className="text-[var(--color-text-secondary)] text-sm">Si tu email está registrado, recibirás un enlace para restablecer tu contraseña.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" />
              <Button type="submit" loading={loading} className="w-full">Enviar enlace</Button>
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
