"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { useToast } from "@/hooks/use-toast";
import {
    UserPlus,
    Mail,
    KeyRound,
    User,
    Loader2,
    Eye,
    EyeOff,
} from "lucide-react";
import { insforge } from "@/lib/insforge";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "Error",
                description: "Las contraseñas no coinciden.",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Error",
                description: "La contraseña debe tener al menos 6 caracteres.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        const { data, error } = await insforge.auth.signUp({
            email,
            password,
            name: name || undefined,
        });

        if (error) {
            toast({
                title: "Error al registrarse",
                description: error.message || "No se pudo crear la cuenta.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        if (data?.requireEmailVerification) {
            toast({
                title: "Verifica tu correo",
                description:
                    "Te hemos enviado un correo de verificación. Revisa tu bandeja de entrada.",
            });
            router.push("/login");
        } else if (data?.accessToken) {
            toast({
                title: "¡Cuenta creada!",
                description: "Te has registrado exitosamente.",
            });
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
            <Card className="w-full max-w-md shadow-xl bg-card text-card-foreground">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 text-primary">
                        <UserPlus className="h-12 w-12" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Crear Cuenta</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Regístrate para comenzar a optimizar tus imágenes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Nombre <span className="text-muted-foreground">(opcional)</span>
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Tu nombre"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10 bg-input text-foreground border-border focus:bg-background"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Correo electrónico
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-10 bg-input text-foreground border-border focus:bg-background"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Contraseña
                            </Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="pl-10 pr-10 bg-input text-foreground border-border focus:bg-background"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirmar contraseña
                            </Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Repite tu contraseña"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="pl-10 bg-input text-foreground border-border focus:bg-background"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full font-semibold h-11"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando cuenta...
                                </>
                            ) : (
                                "Crear Cuenta"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    ¿Ya tienes cuenta?
                                </span>
                            </div>
                        </div>
                        <Link href="/login" className="block mt-4">
                            <Button variant="outline" className="w-full font-semibold h-11">
                                Iniciar Sesión
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
            <footer className="mt-8 text-center text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground transition-colors">
                    ← Volver al inicio
                </Link>
            </footer>
        </div>
    );
}
