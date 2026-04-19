import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api';
import { usersApi } from '../../api/users.api';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export function AuthBootstrap({ children }) {
  const {
    authStatus,
    bootstrapStarted,
    bootstrapSuccess,
    bootstrapAnonymous,
    bootstrapError
  } = useAuthStore();
  const { setTheme } = useThemeStore();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (useAuthStore.getState().authStatus !== 'idle') return;

      bootstrapStarted();
      try {
        const { accessToken } = await authApi.refresh();
        const user = await usersApi.getMe();
        bootstrapSuccess(user, accessToken);
        if (!cancelled && user?.theme) setTheme(user.theme);
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          bootstrapAnonymous();
          return;
        }
        if (!cancelled) {
          if (status === 429) {
            toast.error('Demasiados intentos. Espera un momento y vuelve a probar.');
          } else {
            toast.error('No se pudo restaurar tu sesión.');
          }
        }
        bootstrapError();
      }
    }

    bootstrap();
    return () => { cancelled = true; };
  }, [bootstrapAnonymous, bootstrapError, bootstrapStarted, bootstrapSuccess, setTheme]);

  return children;
}
