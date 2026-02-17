"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ImagePlay,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  FileImage,
  Download,
  ChevronDown,
} from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@insforge/nextjs";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <ImagePlay className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Zoe <span className="text-primary">Convert</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm font-medium">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="text-sm font-semibold">
                  Crear Cuenta
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="sm" variant="outline" className="text-sm font-medium">
                  Ir al Dashboard
                </Button>
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            Conversión inteligente de imágenes
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
            Convierte a WebP y
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              renombra con IA
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            La herramienta definitiva para optimizar imágenes. Compresión WebP
            inteligente y <span className="font-semibold text-foreground">
              renombrado automático con IA
            </span>{" "}
            para mejorar tu SEO y organización.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignedOut>
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                  Ir al Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
            <a href="#features">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base font-medium">
                Saber más
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Todo lo que necesitas
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Herramientas poderosas para optimizar tus imágenes de forma profesional.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Sparkles,
              title: "Renombrado con IA",
              description:
                "Olvídate de 'IMG_2024'. Nuestra IA analiza el contenido y renombra tus archivos automáticamente para mejorar tu SEO.",
            },
            {
              icon: Zap,
              title: "Conversión Instantánea",
              description:
                "Transforma tus imágenes a WebP en milisegundos. Compresión inteligente que reduce el peso hasta un 80%.",
            },
            {
              icon: Shield,
              title: "Privacidad Total",
              description:
                "El procesamiento se realiza en tu navegador. Tus imágenes nunca salen de tu dispositivo ni se suben a servidores.",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="group border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-card/30 backdrop-blur-sm border-y border-border/30">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Tres simples pasos para optimizar tus imágenes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: FileImage,
                title: "Sube tus imágenes",
                description:
                  "Arrastra y suelta o selecciona tus archivos PNG, JPEG, GIF, BMP o TIFF.",
              },
              {
                step: "02",
                icon: Sparkles,
                title: "Ajusta la calidad",
                description:
                  "Elige el nivel de compresión ideal y previsualiza los resultados en tiempo real.",
              },
              {
                step: "03",
                icon: Download,
                title: "Descarga en WebP",
                description:
                  "Obtén tus imágenes optimizadas listas para usar en tu sitio web o aplicación.",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-5">
                  <div className="absolute inset-0 rounded-2xl bg-primary/10" />
                  <div className="absolute inset-0 rounded-2xl flex items-center justify-center">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planes y Precios
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <Card className="relative border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col">
            <CardContent className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold mb-1">Starter</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold">Gratis</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Perfecto para probar la herramienta.
              </p>
              <ul className="space-y-3 text-sm mb-8 flex-grow">
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  Conversión WebP ilimitada
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  50 renombrados con IA/mes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  Hasta 5 imágenes por lote
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-bold">✗</span>
                  Soporte prioritario
                </li>
              </ul>
              <SignedOut>
                <Link href="/signup">
                  <Button variant="outline" className="w-full font-semibold">
                    Comenzar Gratis
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full font-semibold">
                    Ir al Dashboard
                  </Button>
                </Link>
              </SignedIn>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary/50 bg-card/50 backdrop-blur-sm shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 flex flex-col ring-2 ring-primary/30">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                Popular
              </span>
            </div>
            <CardContent className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold mb-1">Pro</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold">$7</span>
                <span className="text-muted-foreground text-sm">/mes</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Ideal para creadores de contenido.
              </p>
              <ul className="space-y-3 text-sm mb-8 flex-grow">
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  Conversión WebP ilimitada
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  3,000 renombrados con IA/mes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  Hasta 50 imágenes por lote
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  Soporte prioritario
                </li>
              </ul>
              <Button className="w-full font-semibold shadow-md">
                Próximamente
              </Button>
            </CardContent>
          </Card>

          {/* Agency Plan */}
          <Card className="relative border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                Mejor Valor
              </span>
            </div>
            <CardContent className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold mb-1">Agency</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold">$24</span>
                <span className="text-muted-foreground text-sm">/mes</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Para agencias y equipos grandes.
              </p>
              <ul className="space-y-3 text-sm mb-8 flex-grow">
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  Conversión WebP ilimitada
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  20,000 renombrados con IA/mes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  Hasta 100 imágenes por lote
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span>
                  Soporte prioritario
                </li>
              </ul>
              <Button className="w-full font-semibold shadow-md">
                Próximamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/20 p-12 text-center">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para optimizar tus imágenes?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
              Crea tu cuenta gratuita y comienza a convertir imágenes a WebP en
              segundos.
            </p>
            <SignedOut>
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg">
                  Empezar Ahora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg">
                  Ir al Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/20">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ImagePlay className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Zoe Convert</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Zoe Convert. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
