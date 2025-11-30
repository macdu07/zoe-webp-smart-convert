"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, ImagePlay } from "lucide-react"; // Updated import

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result.success) {
      toast({
        title: "Acceso concedido",
        description: "Bienvenido a Zoe Convert.",
      });
      // Router push is not strictly needed as middleware/action will handle redirect,
      // but good for immediate feedback if action doesn't redirect.
      // However, the action returns success, so we can let the router refresh or push.
      router.push("/");
    } else {
      toast({
        title: "Error de acceso",
        description: result.error || "La clave de acceso es incorrecta.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <Card className="w-full max-w-md shadow-xl bg-card text-card-foreground">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-primary">
            <ImagePlay className="h-12 w-12" /> {/* Updated icon */}
          </div>
          <CardTitle className="text-3xl font-bold">Zoe Convert</CardTitle>
          <CardDescription className="text-muted-foreground">
            Por favor, introduce tu clave de acceso para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accessKey" className="text-sm font-medium">
                Clave de Acceso
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="accessKey"
                  name="accessKey"
                  type="password"
                  placeholder="Tu clave secreta"
                  required
                  className="pl-10 bg-input text-foreground border-border focus:bg-background"
                  aria-describedby="accessKey-description"
                />
              </div>
              <p
                id="accessKey-description"
                className="text-xs text-muted-foreground"
              >
                Esta herramienta está protegida.
              </p>
            </div>
            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Verificando..." : "Acceder"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Zoe Convert. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
