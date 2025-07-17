import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
            <div className="inline-block">
              <Logo className="h-16 w-16" />
            </div>
            <h1 className="text-4xl font-bold text-primary mt-4 font-headline">
              ServiceRig 2.0
            </h1>
            <p className="text-muted-foreground mt-2">From Dispatch to Dollars</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
