import { supabase } from "../lib/supabase";

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Ошибка входа администратора:", error);

    return {
      user: null,
      error: error.message,
    };
  }

  return {
    user: data.user,
    error: null,
  };
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Ошибка выхода администратора:", error);
  }
}

export async function getCurrentAdminSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Ошибка получения сессии:", error);
    return null;
  }

  return data.session;
}

export async function checkIsCurrentUserAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin");

  if (error) {
    console.error("Ошибка проверки прав администратора:", error);
    return false;
  }

  return Boolean(data);
}