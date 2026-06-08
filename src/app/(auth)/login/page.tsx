import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-[#07070b] text-zinc-400">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
