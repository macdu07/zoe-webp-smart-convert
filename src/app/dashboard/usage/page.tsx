"use client";

import { useEffect, useState } from "react";
import { useUser } from "@insforge/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    BarChart3,
    Crown,
    Sparkles,
    Calendar,
    ImageIcon,
    Loader2,
} from "lucide-react";
import {
    getUserProfile,
    getConversionHistory,
    PLANS,
    type UserProfile,
    type ConversionLog,
    type PlanKey,
} from "@/lib/usage";

export default function UsagePage() {
    const { user, isLoaded } = useUser();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [history, setHistory] = useState<ConversionLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoaded && user) {
            const fetchData = async () => {
                setLoading(true);
                const [p, h] = await Promise.all([
                    getUserProfile(user.id),
                    getConversionHistory(user.id, 20),
                ]);
                setProfile(p);
                setHistory(h);
                setLoading(false);
            };
            fetchData();
        }
    }, [isLoaded, user]);

    if (!isLoaded || loading) {
        return (
            <div className="container mx-auto px-4 py-16 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
                No se pudo cargar el perfil.
            </div>
        );
    }

    const usagePercent = Math.min(
        Math.round(
            (profile.ai_conversions_used / profile.ai_conversions_limit) * 100
        ),
        100
    );
    const planInfo = PLANS[profile.plan as PlanKey] ?? PLANS.starter;
    const periodStart = new Date(profile.period_start);
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 30);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Uso & Plan</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Current Plan */}
                <Card className="shadow-lg bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Crown className="h-5 w-5 text-primary" />
                            Tu Plan Actual
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold">{planInfo.name}</span>
                            {planInfo.price > 0 && (
                                <span className="text-muted-foreground text-sm">
                                    ${planInfo.price}/mes
                                </span>
                            )}
                            {planInfo.price === 0 && (
                                <span className="text-sm text-muted-foreground">Gratis</span>
                            )}
                        </div>
                        <ul className="text-sm space-y-1.5 text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                {planInfo.aiConversionsLimit.toLocaleString()} renombrados
                                IA/mes
                            </li>
                            <li className="flex items-center gap-2">
                                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                                Hasta {planInfo.maxBatchSize} imágenes por lote
                            </li>
                            <li className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                Periodo: {periodStart.toLocaleDateString()} —{" "}
                                {periodEnd.toLocaleDateString()}
                            </li>
                        </ul>
                        {profile.plan === "starter" && (
                            <Button className="w-full font-semibold mt-2" disabled>
                                Upgrade — Próximamente
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Usage Meter */}
                <Card className="shadow-lg bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Uso de IA este periodo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            <span className="text-4xl font-extrabold text-primary">
                                {profile.ai_conversions_used}
                            </span>
                            <span className="text-muted-foreground text-lg">
                                {" "}
                                / {profile.ai_conversions_limit.toLocaleString()}
                            </span>
                        </div>
                        <Progress value={usagePercent} className="h-3" />
                        <p className="text-xs text-center text-muted-foreground">
                            {usagePercent}% utilizado — te quedan{" "}
                            {(
                                profile.ai_conversions_limit - profile.ai_conversions_used
                            ).toLocaleString()}{" "}
                            conversiones AI
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Conversion History */}
            <Card className="shadow-lg bg-card">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        Historial de Conversiones
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {history.length === 0 ? (
                        <p className="text-muted-foreground text-center py-6">
                            Aún no has realizado ninguna conversión.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left text-muted-foreground">
                                        <th className="pb-2 font-medium">Fecha</th>
                                        <th className="pb-2 font-medium">Imágenes</th>
                                        <th className="pb-2 font-medium">IA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="border-b border-border/50 last:border-0"
                                        >
                                            <td className="py-2.5">
                                                {new Date(log.created_at).toLocaleString("es-ES", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                            <td className="py-2.5">{log.file_count}</td>
                                            <td className="py-2.5">
                                                {log.ai_used ? (
                                                    <span className="inline-flex items-center gap-1 text-primary font-medium">
                                                        <Sparkles className="h-3 w-3" />
                                                        Sí
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">No</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
