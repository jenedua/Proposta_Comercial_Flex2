import React from 'react';
import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {ArrowRight, LockKeyhole, Mail, ShieldCheck} from 'lucide-react';
import AuthBrand from '../components/AuthBrand';
import {Button} from '../../../shared/components/ui/Button';
import {Input} from '../../../shared/components/ui/Input';
import {getRequestErrorMessage, readApiError} from '../../../shared/lib/api';

const highlights = [
  'Centralize clientes, itens e propostas em um unico fluxo.',
  'Compartilhe propostas com link publico e acompanhe retornos.',
  'Mantenha seu comercial organizado com uma experiencia mais limpa.',
];

const teamBadges = ['AF', 'CF', 'VX'];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password}),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, 'Erro ao fazer login.'));
      }

      const data = await res.json();

      localStorage.setItem('flex_token', data.token);
      localStorage.setItem('flex_user', JSON.stringify(data.user));
      localStorage.setItem('flex_remember', rememberMe ? 'true' : 'false');
      navigate('/dashboard');
    } catch (err: any) {
      setError(getRequestErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#ece8df] text-[#161616]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-10%] h-72 w-72 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute bottom-[-14%] right-[-8%] h-96 w-96 rounded-full bg-[#d5c4b0]/35 blur-3xl" />
        <div className="absolute inset-y-0 left-[6%] hidden w-px bg-black/5 lg:block" />
        <div className="absolute inset-y-0 right-[6%] hidden w-px bg-black/5 lg:block" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[34px] border border-black/8 bg-[#f7f3ec]/95 shadow-[0_30px_120px_rgba(12,12,12,0.12)] backdrop-blur lg:grid-cols-[0.94fr_1.06fr]">
          <section className="relative flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
            <AuthBrand caption="Workspace comercial premium" className="mb-10" />

            <div className="max-w-md">
              <p className="mb-3 text-sm font-medium text-black/45">Bem-vindo de volta</p>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-5xl">
                Entrar na sua
                <span className="block text-[#5f5247]">central de propostas</span>
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-black/58 sm:text-base">
                Um acesso premium para acompanhar clientes, valores e propostas com mais clareza visual e ritmo comercial.
              </p>
            </div>

            <form className="mt-10 max-w-md space-y-5" onSubmit={handleLogin}>
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 shadow-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-black/70">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                  <Input
                    type="email"
                    required
                    placeholder="voce@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 rounded-2xl border-[#e7dfd2] bg-white/80 pl-11 pr-4 text-[15px] shadow-[0_12px_30px_rgba(17,17,17,0.05)] placeholder:text-[#9b9389] focus:border-[#b6a28d] focus:ring-[#b6a28d]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium text-black/70">Senha</label>
                  <span className="text-xs font-medium uppercase tracking-[0.22em] text-black/35">Acesso seguro</span>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                  <Input
                    type="password"
                    required
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 rounded-2xl border-[#e7dfd2] bg-white/80 pl-11 pr-4 text-[15px] shadow-[0_12px_30px_rgba(17,17,17,0.05)] placeholder:text-[#9b9389] focus:border-[#b6a28d] focus:ring-[#b6a28d]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-1 text-sm text-black/60 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-black/20 accent-black"
                  />
                  <span>Lembrar meu acesso</span>
                </label>
                <span className="text-black/45">Protegido por sessao autenticada</span>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="group h-14 w-full rounded-2xl bg-[linear-gradient(135deg,#121212_0%,#1f2430_100%)] text-base font-semibold text-white shadow-[0_20px_35px_rgba(17,17,17,0.28)] hover:opacity-95"
              >
                <span>{loading ? 'Entrando...' : 'Entrar na plataforma'}</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>

              <div className="flex flex-col gap-3 border-t border-black/8 pt-6 text-sm text-black/58 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Ainda nao tem conta?{' '}
                  <Link to="/register" className="font-semibold text-[#111111] transition-colors hover:text-[#5f5247]">
                    Criar acesso
                  </Link>
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-black/35">Experiencia desktop e mobile</p>
              </div>
            </form>
          </section>

          <aside className="relative hidden min-h-[760px] overflow-hidden bg-[#080808] p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-10">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_34%),linear-gradient(135deg,_rgba(255,255,255,0.03),_transparent_42%)]" />
              <div className="absolute -right-20 top-[-4%] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,_rgba(201,187,167,0.2),_transparent_62%)]" />
              <div className="absolute bottom-16 left-[-80px] h-px w-80 rotate-[24deg] bg-gradient-to-r from-transparent via-white/18 to-transparent" />
              <div className="absolute right-6 top-10 h-[1px] w-52 rotate-[-44deg] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
              <div className="absolute right-20 top-24 h-[1px] w-80 rotate-[-44deg] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <div className="absolute right-0 top-0 h-56 w-56 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_60%)]" />
            </div>

            <div className="relative">
              <AuthBrand tone="dark" caption="Workspace comercial premium" className="mb-16 text-white/90" />

              <div className="relative mb-16 flex h-60 items-center justify-center overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))]">
                <div className="absolute left-[22%] top-[8%] h-48 w-16 origin-bottom rotate-[33deg] rounded-[28px] bg-[linear-gradient(180deg,#3b3839_0%,#1e1d1d_100%)] shadow-[0_20px_50px_rgba(0,0,0,0.45)]" />
                <div className="absolute right-[27%] top-[8%] h-48 w-16 origin-bottom rotate-[-33deg] rounded-[28px] bg-[linear-gradient(180deg,#3b3839_0%,#1e1d1d_100%)] shadow-[0_20px_50px_rgba(0,0,0,0.45)]" />
                <div className="absolute top-[36%] h-10 w-10 rotate-45 bg-[linear-gradient(180deg,#8d6f5d_0%,#4f4038_100%)] opacity-85 shadow-[0_12px_20px_rgba(0,0,0,0.4)]" />
                <div className="absolute bottom-8 left-12 h-16 w-28 rounded-full bg-black/40 blur-2xl" />
              </div>

              <div className="max-w-lg">
                <p className="text-sm tracking-[0.18em] text-white/48 uppercase">Sua marca com mais presenca</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
                  Uma identidade de acesso mais forte, limpa e pronta para vender.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-white/62">
                  A nova direcao visual conecta login e cadastro com a mesma assinatura de produto: elegante, comercial e contemporanea.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.08] p-7 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="absolute -right-8 top-0 h-20 w-28 rounded-bl-[28px] rounded-tr-[28px] bg-black/30" />
              <div className="relative">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/58">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Branding alinhado
                </div>

                <p className="max-w-sm text-3xl font-semibold leading-tight tracking-[-0.04em] text-white">
                  Entre, acompanhe negociações e mantenha cada proposta sob controle.
                </p>

                <div className="mt-6 space-y-3">
                  {highlights.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm leading-6 text-white/68">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#ccb49b]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/42">Equipe comercial</p>
                    <p className="mt-2 text-sm text-white/70">Projetado para operar com agilidade sem perder a elegancia.</p>
                  </div>

                  <div className="flex -space-x-3">
                    {teamBadges.map((badge, index) => (
                      <div
                        key={badge}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#111111] text-xs font-semibold ${
                          index === 0
                            ? 'bg-[#f3ecdf] text-[#181818]'
                            : index === 1
                              ? 'bg-[#b6967f] text-white'
                              : 'bg-[#2d2d2d] text-white'
                        }`}
                      >
                        {badge}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
