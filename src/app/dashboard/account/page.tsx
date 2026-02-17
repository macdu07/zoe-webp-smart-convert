"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@insforge/nextjs";
import { insforge } from "@/lib/insforge";
import {
    getUserProfile,
    PLANS,
    type UserProfile,
    type PlanKey,
} from "@/lib/usage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
    User,
    Mail,
    Lock,
    CreditCard,
    Crown,
    Loader2,
    LogOut,
    Save,
    Send,
} from "lucide-react";

export default function AccountPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    // Profile state
    const [name, setName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    // Password reset state
    const [resetStep, setResetStep] = useState<"idle" | "code_sent" | "enter_code">("idle");
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [sendingReset, setSendingReset] = useState(false);
    const [resettingPassword, setResettingPassword] = useState(false);

    // Plan
    const [appProfile, setAppProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoaded && user) {
            setName(user.profile?.name ?? "");
            setAvatarUrl(user.profile?.avatar_url ?? "");
            getUserProfile(user.id).then((p) => {
                setAppProfile(p);
                setLoading(false);
            });
        }
    }, [isLoaded, user]);

    if (!isLoaded || loading) {
        return (
            <div className="container mx-auto px-4 py-16 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    const planInfo = PLANS[(appProfile?.plan as PlanKey) ?? "starter"];

    // ── Handlers ──────────────────────────────────────────────────────
    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            const { error } = await insforge.auth.setProfile({
                name: name.trim(),
                avatar_url: avatarUrl.trim() || undefined,
            });
            if (error) throw error;
            toast({ title: "Perfil actualizado", description: "Tus cambios se han guardado." });
        } catch (err: any) {
            toast({ title: "Error", description: err?.message ?? "No se pudo guardar.", variant: "destructive" });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSendResetCode = async () => {
        setSendingReset(true);
        try {
            const { data, error } = await insforge.auth.sendResetPasswordEmail({ email: user.email });
            if (error) throw error;
            setResetStep("enter_code");
            toast({ title: "Código enviado", description: `Se envió un código de verificación a ${user.email}.` });
        } catch (err: any) {
            toast({ title: "Error", description: err?.message ?? "No se pudo enviar el código.", variant: "destructive" });
        } finally {
            setSendingReset(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
            return;
        }
        if (newPassword.length < 6) {
            toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
            return;
        }

        setResettingPassword(true);
        try {
            // Step 1: Exchange code for token
            const { data: tokenData, error: tokenErr } = await insforge.auth.exchangeResetPasswordToken({
                email: user.email,
                code: resetCode,
            });
            if (tokenErr) throw tokenErr;

            // Step 2: Reset password with token
            const { error: resetErr } = await insforge.auth.resetPassword({
                newPassword,
                otp: tokenData!.token,
            });
            if (resetErr) throw resetErr;

            toast({ title: "Contraseña actualizada", description: "Tu contraseña se ha cambiado exitosamente." });
            setResetStep("idle");
            setResetCode("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            toast({ title: "Error", description: err?.message ?? "No se pudo cambiar la contraseña.", variant: "destructive" });
        } finally {
            setResettingPassword(false);
        }
    };

    const handleSignOut = async () => {
        await insforge.auth.signOut();
        window.location.href = "/";
    };

    // ── Render ────────────────────────────────────────────────────────
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h2 className="text-2xl font-bold mb-6">Mi Cuenta</h2>

            <div className="space-y-6">
                {/* ── Profile Section ───────────────────────────────────── */}
                <Card className="shadow-lg bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Perfil
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden flex-shrink-0">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold truncate">{name || "Sin nombre"}</p>
                                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="name" className="text-xs text-muted-foreground">Nombre</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Tu nombre"
                                    className="mt-1 bg-input"
                                />
                            </div>
                            <div>
                                <Label htmlFor="avatar" className="text-xs text-muted-foreground">URL de Avatar</Label>
                                <Input
                                    id="avatar"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="mt-1 bg-input"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                            className="font-semibold"
                        >
                            {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Guardar Cambios
                        </Button>
                    </CardContent>
                </Card>

                {/* ── Email Section ─────────────────────────────────────── */}
                <Card className="shadow-lg bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            Correo Electrónico
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <Label className="text-xs text-muted-foreground">Correo actual</Label>
                            <Input value={user.email} disabled className="mt-1 bg-muted" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Para cambiar tu correo electrónico, contacta a soporte.
                        </p>
                    </CardContent>
                </Card>

                {/* ── Password Section ──────────────────────────────────── */}
                <Card className="shadow-lg bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" />
                            Contraseña
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {resetStep === "idle" && (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    Para cambiar tu contraseña, enviaremos un código de verificación a tu correo.
                                </p>
                                <Button
                                    onClick={handleSendResetCode}
                                    disabled={sendingReset}
                                    variant="outline"
                                    className="font-semibold"
                                >
                                    {sendingReset ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Enviar Código de Verificación
                                </Button>
                            </>
                        )}

                        {resetStep === "enter_code" && (
                            <>
                                <div>
                                    <Label htmlFor="reset-code" className="text-xs text-muted-foreground">Código de verificación</Label>
                                    <Input
                                        id="reset-code"
                                        value={resetCode}
                                        onChange={(e) => setResetCode(e.target.value)}
                                        placeholder="123456"
                                        maxLength={6}
                                        className="mt-1 bg-input font-mono text-center text-lg tracking-widest"
                                    />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="new-pass" className="text-xs text-muted-foreground">Nueva contraseña</Label>
                                        <Input
                                            id="new-pass"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Mínimo 6 caracteres"
                                            className="mt-1 bg-input"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="confirm-pass" className="text-xs text-muted-foreground">Confirmar contraseña</Label>
                                        <Input
                                            id="confirm-pass"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repetir contraseña"
                                            className="mt-1 bg-input"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleResetPassword}
                                        disabled={resettingPassword || !resetCode || !newPassword || !confirmPassword}
                                        className="font-semibold"
                                    >
                                        {resettingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                                        Cambiar Contraseña
                                    </Button>
                                    <Button
                                        onClick={() => { setResetStep("idle"); setResetCode(""); setNewPassword(""); setConfirmPassword(""); }}
                                        variant="ghost"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* ── Plan & Payment Section ────────────────────────────── */}
                <Card className="shadow-lg bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            Plan y Pagos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <Crown className="h-6 w-6 text-primary flex-shrink-0" />
                            <div>
                                <p className="font-semibold">{planInfo.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {planInfo.price === 0 ? "Gratis" : `$${planInfo.price}/mes`} —{" "}
                                    {planInfo.aiConversionsLimit.toLocaleString()} conversiones IA/mes
                                </p>
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs text-muted-foreground">Método de pago</Label>
                            <div className="mt-1 p-3 rounded-lg border border-dashed border-border text-sm text-muted-foreground text-center">
                                No hay método de pago configurado.
                            </div>
                        </div>

                        <Button disabled variant="outline" className="font-semibold">
                            Gestionar Pagos — Próximamente
                        </Button>
                    </CardContent>
                </Card>

                {/* ── Danger Zone ───────────────────────────────────────── */}
                <Card className="shadow-lg bg-card border-destructive/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-destructive">
                            <LogOut className="h-5 w-5" />
                            Sesión
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Cierra tu sesión en este dispositivo.
                        </p>
                        <Button
                            onClick={handleSignOut}
                            variant="destructive"
                            className="font-semibold"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Cerrar Sesión
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
