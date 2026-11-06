import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthFormSkeleton, AuthShell } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { safeNext } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { title: "Iniciar sesión" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthShell title="Iniciar sesión">
      {/* searchParams y la cookie son datos de la peticion: se leen detras de Suspense */}
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function LoginContent({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) {
  const sp = await searchParams;
  const next = safeNext(Array.isArray(sp.next) ? sp.next[0] : sp.next);

  // Si ya hay sesion valida no tiene sentido mostrar el login
  if (await getCurrentUser()) redirect(next);

  return (
    <>
      {sp.expirada ? (
        <p
          role="status"
          className="mb-4 rounded border border-amber/50 bg-amber/10 px-3 py-2 text-sm text-amber"
        >
          Tu sesión expiró. Inicia sesión de nuevo para continuar.
        </p>
      ) : null}
      <LoginForm next={next} />
      <p className="mt-6 text-sm text-muted">
        ¿No tienes cuenta?{" "}
        <Link
          href={next === "/" ? "/registro" : `/registro?next=${encodeURIComponent(next)}`}
          className="text-amber underline underline-offset-4 hover:no-underline"
        >
          Crear cuenta
        </Link>
      </p>
    </>
  );
}
