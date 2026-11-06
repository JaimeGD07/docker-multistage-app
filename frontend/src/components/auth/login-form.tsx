"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { Field } from "./field";
import { SubmitButton } from "./submit-button";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="space-y-4" noValidate={false}>
      <input type="hidden" name="next" value={next} />
      {state?.error ? (
        <p
          role="alert"
          className="rounded border border-out/50 bg-out/10 px-3 py-2 text-sm text-out"
        >
          {state.error}
        </p>
      ) : null}
      <Field
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state?.values?.email}
        errors={state?.fieldErrors?.email}
      />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        errors={state?.fieldErrors?.password}
      />
      <SubmitButton pendingLabel="Ingresando…">Iniciar sesión</SubmitButton>
    </form>
  );
}
