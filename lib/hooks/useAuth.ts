import { useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAppStore } from '../store';
import { User } from '../types';
import { logger } from '../logger';
import { trackEvent } from '../metrics';
import { AuthenticationError, ValidationError, ErrorHandler } from '../errors';

/**
 * Custom Hook для аутентификации
 * Управляет состоянием пользователя и сессией
 */
export function useAuth() {
  const { user, setUser } = useAppStore();

  /**
   * Проверка текущего пользователя
   */
  const checkUser = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        if (profile) {
          const userData: User = {
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
            createdAt: profile.created_at,
          };
          setUser(userData);
          logger.debug('User session restored', { userId: userData.id });
        }
      }
    } catch (error) {
      logger.error('Failed to check user session', error instanceof Error ? error : undefined);
    }
  }, [setUser]);

  useEffect(() => {
    // Проверяем текущую сессию при загрузке
    checkUser();

    // Подписываемся на изменения аутентификации
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Обрабатываем только события входа/выхода, игнорируем INITIAL_SESSION
        if (event === 'INITIAL_SESSION') return;
        
        logger.info('Auth state changed', { event, userId: session?.user?.id });
        
        if (session?.user) {
          try {
            // Получаем полные данные пользователя из profiles
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) throw error;

            if (profile) {
              const userData: User = {
                id: profile.id,
                email: profile.email,
                fullName: profile.full_name,
                avatarUrl: profile.avatar_url,
                createdAt: profile.created_at,
              };
              setUser(userData);
              logger.info('User authenticated', { userId: userData.id });
            }
          } catch (error) {
            logger.error('Failed to load user profile', error instanceof Error ? error : undefined, {
              userId: session.user.id,
            });
          }
        } else {
          setUser(null);
          logger.info('User logged out');
        }
      }
    );

    // Отписываемся при размонтировании компонента
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkUser, setUser]);

  /**
   * Регистрация нового пользователя
   */
  async function signUp(email: string, password: string, fullName: string) {
    try {
      // Валидация входных данных
      if (!email || !email.includes('@')) {
        throw new ValidationError('Invalid email address', [
          { field: 'email', message: 'Please enter a valid email address' },
        ]);
      }

      if (!password || password.length < 6) {
        throw new ValidationError('Invalid password', [
          { field: 'password', message: 'Password must be at least 6 characters' },
        ]);
      }

      if (!fullName || fullName.trim().length === 0) {
        throw new ValidationError('Invalid name', [
          { field: 'fullName', message: 'Please enter your full name' },
        ]);
      }

      logger.info('User signup attempt', { email });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        logger.error('Signup failed', error, { email });
        throw new AuthenticationError(error.message);
      }

      trackEvent.userSignup();
      logger.info('User signed up successfully', { email, userId: data.user?.id });

      return data;
    } catch (error) {
      throw ErrorHandler.handle(error, { operation: 'signUp', email });
    }
  }

  /**
   * Вход в систему
   */
  async function signIn(email: string, password: string) {
    try {
      // Валидация входных данных
      if (!email || !email.includes('@')) {
        throw new ValidationError('Invalid email address', [
          { field: 'email', message: 'Please enter a valid email address' },
        ]);
      }

      if (!password) {
        throw new ValidationError('Invalid password', [
          { field: 'password', message: 'Please enter your password' },
        ]);
      }

      logger.info('User login attempt', { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.warn('Login failed', { email, error: error.message });
        trackEvent.userLogin(false);
        throw new AuthenticationError('Invalid email or password');
      }

      trackEvent.userLogin(true);
      logger.info('User logged in successfully', { email, userId: data.user?.id });

      return data;
    } catch (error) {
      throw ErrorHandler.handle(error, { operation: 'signIn', email });
    }
  }

  /**
   * Выход из системы
   */
  async function signOut() {
    try {
      const userId = user?.id;
      logger.info('User logout attempt', { userId });

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Logout failed', error, { userId });
        throw error;
      }

      setUser(null);
      logger.info('User logged out successfully', { userId });
    } catch (error) {
      throw ErrorHandler.handle(error, { operation: 'signOut' });
    }
  }

  /**
   * Вход через Google OAuth
   */
  async function signInWithGoogle() {
    try {
      logger.info('Google OAuth login attempt');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        logger.error('Google OAuth failed', error);
        throw new AuthenticationError('Failed to authenticate with Google');
      }

      logger.info('Google OAuth initiated');
      return data;
    } catch (error) {
      throw ErrorHandler.handle(error, { operation: 'signInWithGoogle' });
    }
  }

  return {
    user,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    isAuthenticated: !!user,
  };
}
