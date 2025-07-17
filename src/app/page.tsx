import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-4">
          <Logo className="h-28 w-auto text-primary" />
          <Image
            src="/logo-name.png"
            alt="ServiceRig Full Logo"
            width={312}
            height={78}
            priority
            className="dark:invert"
          />
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
