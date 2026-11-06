import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthFormSkeleton, AuthShell } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { safeNext } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { title: "Crear cuenta" };

export default function RegisterPage({ searchParams }: PageProps<"/registro">) {
  return (
    <AuthShell title="Crear cuenta">
      <Suspense fallback={<AuthFormSkeleton fields={4} />}>
        <RegisterContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function RegisterContent({
  searchParams,
}: {
  searchParams: PageProps<"/registro">["searchParams"];
}) {
  const sp = await searchParams;
  const next = safeNext(Array.isArray(sp.next) ? sp.next[0] : sp.next);

  if (await getCurrentUser()) redirect(next);

  return (
    <>
      <RegisterForm next={next} />
      <p className="mt-6 text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
          className="text-amber underline underline-offset-4 hover:no-underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </>
  );
}
