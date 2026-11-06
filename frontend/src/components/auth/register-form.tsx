"use client";

import { useActionState } from "react";
import { registerAction } from "@/lib/actions/auth";
import { Field } from "./field";
import { SubmitButton } from "./submit-button";

export function RegisterForm({ next }: { next: string }) {
  const [state, action] = useActionState(registerAction, undefined);

  return (
    <form action={action} className="space-y-4">
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
        label="Nombre"
        name="name"
        autoComplete="name"
        defaultValue={state?.values?.name}
        errors={state?.fieldErrors?.name}
      />
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
        autoComplete="new-password"
        minLength={8}
        hint="Mínimo 8 caracteres."
        errors={state?.fieldErrors?.password}
      />
      <Field
        label="Confirmar contraseña"
        name="password_confirmation"
        type="password"
        autoComplete="new-password"
        errors={state?.fieldErrors?.password_confirmation}
      />
      <SubmitButton pendingLabel="Creando cuenta…">Crear cuenta</SubmitButton>
    </form>
  );
}
