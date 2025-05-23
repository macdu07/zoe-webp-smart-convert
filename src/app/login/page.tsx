"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [accessKey, setAccessKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (login(accessKey)) {
      toast({
        title: 'Acceso concedido',
        description: 'Bienvenido a Zoe Convert.',
      });
      router.push('/');
    } else {
      toast({
        title: 'Error de acceso',
        description: 'La clave de acceso es incorrecta.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <LogoIcon />
          </div>
          <CardTitle className="text-3xl font-bold">Zoe WebP Smart Convert</CardTitle>
          <CardDescription>Por favor, introduce tu clave de acceso para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accessKey" className="text-sm font-medium">Clave de Acceso</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="accessKey"
                  type="password"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="Tu clave secreta"
                  required
                  className="pl-10"
                  aria-describedby="accessKey-description"
                />
              </div>
              <p id="accessKey-description" className="text-xs text-muted-foreground">
                Esta herramienta está protegida.
              </p>
            </div>
            <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Acceder'}
            </Button>
          </form>
        </CardContent>
      </Card>
       <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Zoe Convert. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
