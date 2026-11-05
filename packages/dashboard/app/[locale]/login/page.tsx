'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card, Field, Input, PasswordInput, SectionTitle } from '@properlia/shared/components/ui';
import { useT } from '@properlia/shared/components/TranslationProvider';

export default function LoginPage() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      router.push('/es');
    } catch (err) {
      setError('Credenciales inválidas. Por favor intenta de nuevo.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <Card padding="none" className="max-w-md w-full space-y-8 p-8">
        <div className="flex flex-col items-center">
          <Image
            src="/properlia.png"
            alt="Properlia"
            width={200}
            height={50}
            priority
            className="h-12 w-auto"
          />
          <SectionTitle className="mt-6 text-center md:text-3xl">
            Iniciar Sesión
          </SectionTitle>
          <p className="mt-2 text-center text-sm text-brand-carbon/70">
            Panel de Administración de Properlia
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Field label={t('email')} htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="correo@ejemplo.com"
                value={email}
                invalid={!!error}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label={t('password')} htmlFor="password">
              <PasswordInput
                id="password"
                name="password"
                showLabel={t('showPassword')}
                hideLabel={t('hidePassword')}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                invalid={!!error}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          </div>

          {error && (
            <Alert tone="danger" className="font-medium">
              {error}
            </Alert>
          )}

          <div>
            <Button type="submit" disabled={loading} fullWidth>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
