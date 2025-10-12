import { useEffect } from 'react';
import { supabase } from '../supabase';
import { useAppStore } from '../store';
import { User } from '../types';

/**
 * Custom Hook для аутентификации
 * Управляет состоянием пользователя и сессией
 */
export function useAuth() {
  const { user, setUser } = useAppStore();

  useEffect(() => {
    // Проверяем текущую сессию при загрузке
    checkUser();

    // Подписываемся на изменения аутентификации
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Обрабатываем только события входа/выхода, игнорируем INITIAL_SESSION
        if (event === 'INITIAL_SESSION') return;
        
        if (session?.user) {
          // Получаем полные данные пользователя из profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const userData: User = {
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name,
              avatarUrl: profile.avatar_url,
              createdAt: profile.created_at,
            };
            setUser(userData);
          }
        } else {
          setUser(null);
        }
      }
    );

    // Отписываемся при размонтировании компонента
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setUser]);

  /**
   * Проверка текущего пользователя
   */
  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        const userData: User = {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url,
          createdAt: profile.created_at,
        };
        setUser(userData);
      }
    }
  }

  /**
   * Регистрация нового пользователя
   */
  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Вход в систему
   */
  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Выход из системы
   */
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }

  /**
   * Вход через Google OAuth
   */
  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
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
