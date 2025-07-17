import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/logo";
import { Flame } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center gap-2">
          <div className="relative">
            <Logo className="h-20 w-auto" />
            <Flame className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-6 text-orange-500 animate-pulse" />
          </div>
          <Image
            src="/logo-name.png"
            alt="ServiceRig Full Logo"
            width={312}
            height={78}
            priority
            className="w-56 h-auto filter brightness-0"
          />
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
