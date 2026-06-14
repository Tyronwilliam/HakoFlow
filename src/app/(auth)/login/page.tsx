import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/features/auth/components/login-form";
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg text-sm font-semibold">
          H
        </div>
        <h1 className="text-xl font-semibold">HakoFlow</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connexion</CardTitle>
          <CardDescription>Entre tes identifiants pour accéder à ton espace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs">ou</span>
            <Separator className="flex-1" />
          </div>

          <GoogleSignInButton />
        </CardContent>
      </Card>
    </div>
  );
}
