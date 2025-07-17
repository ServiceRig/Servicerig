import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          {/* Icon logo */}
          <div className="mb-4">
            <Logo className="h-20 w-20 text-primary" />
          </div>

          {/* Full name logo */}
          <div>
            <Image
              src="/logo-name.png"
              alt="ServiceRig Full Logo"
              width={240}
              height={60}
              priority
              className="dark:invert"
            />
          </div>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
