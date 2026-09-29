"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form className="admin-login" action={action}>
      <h1>Заявки</h1>
      <p className="small">Введите пароль администратора.</p>
      <label>
        Пароль
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          autoFocus
        />
      </label>
      <button className="primary submit" disabled={pending}>
        {pending ? "Проверяем…" : "Войти"}
      </button>
      {state.error && (
        <p role="alert" className="form-status">
          {state.error}
        </p>
      )}
    </form>
  );
}
