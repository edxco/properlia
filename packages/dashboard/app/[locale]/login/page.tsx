'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useT } from '@properlia/shared/components/TranslationProvider';
import { playfairDisplay, inter } from '@/src/lib/fonts';
import { textStyles } from '@/src/lib/typography';

export default function LoginPage() {
  const t = useT();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div
      className={`${playfairDisplay.variable} ${inter.variable} min-h-screen flex items-center justify-center bg-gray-50`}
    >
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <Image
            src="/properlia.png"
            alt="Properlia"
            width={200}
            height={50}
            priority
            className="h-12 w-auto"
          />
          <h2 style={textStyles.h2} className="mt-6 text-center">
            Iniciar Sesión
          </h2>
          <p style={textStyles.body} className="mt-2 text-center">
            Panel de Administración de Properlia
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" style={textStyles.label} className="block">
                {t("email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                style={textStyles.body}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 rounded-md focus:outline-none focus:ring-[#1A3A5C] focus:border-[#1A3A5C] focus:z-10"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" style={textStyles.label} className="block">
                {t("password")}
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  style={textStyles.body}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 rounded-md focus:outline-none focus:ring-[#1A3A5C] focus:border-[#1A3A5C]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 z-10 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 style={{ ...textStyles.body, color: '#B91C1C' }}>{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              style={textStyles.button}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md text-white bg-[#1A3A5C] hover:bg-[#142d47] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A3A5C] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
