"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ImagePlay, BarChart3, Sparkles, UserCog } from "lucide-react";
import { useUser } from "@insforge/nextjs";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user } = useUser();

    const navItems = [
        {
            href: "/dashboard",
            label: "Convertir",
            icon: Sparkles,
            active: pathname === "/dashboard",
        },
        {
            href: "/dashboard/usage",
            label: "Uso & Plan",
            icon: BarChart3,
            active: pathname === "/dashboard/usage",
        },
        {
            href: "/dashboard/account",
            label: "Mi Cuenta",
            icon: UserCog,
            active: pathname === "/dashboard/account",
        },
    ];

    const initial =
        user?.profile?.name?.charAt(0)?.toUpperCase() ??
        user?.email?.charAt(0)?.toUpperCase() ??
        "U";

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="bg-background border-b border-border shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2 text-primary">
                            <ImagePlay className="h-6 w-6" />
                            <h1 className="text-xl font-semibold">Zoe Convert</h1>
                        </Link>
                        <nav className="hidden sm:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={item.active ? "secondary" : "ghost"}
                                        size="sm"
                                        className={`text-sm font-medium ${item.active
                                                ? "bg-primary/10 text-primary hover:bg-primary/15"
                                                : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        <item.icon className="mr-1.5 h-4 w-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            ))}
                        </nav>
                    </div>
                    {/* Avatar linking to account page */}
                    <Link href="/dashboard/account">
                        <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-all overflow-hidden flex-shrink-0 ${pathname === "/dashboard/account"
                                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary text-primary-foreground"
                                    : "bg-primary/10 text-primary hover:bg-primary/20"
                                }`}
                        >
                            {user?.profile?.avatar_url ? (
                                <img
                                    src={user.profile.avatar_url}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                initial
                            )}
                        </div>
                    </Link>
                </div>
                {/* Mobile nav */}
                <div className="sm:hidden border-t border-border/50 px-4 py-2 flex gap-1">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className="flex-1">
                            <Button
                                variant={item.active ? "secondary" : "ghost"}
                                size="sm"
                                className={`w-full text-xs font-medium ${item.active
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground"
                                    }`}
                            >
                                <item.icon className="mr-1 h-3.5 w-3.5" />
                                {item.label}
                            </Button>
                        </Link>
                    ))}
                </div>
            </header>

            <main className="flex-grow">{children}</main>

            <footer className="bg-background border-t border-border text-center py-4 mt-auto">
                <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Zoe Convert. Todos los derechos
                    reservados.
                </p>
            </footer>
        </div>
    );
}
