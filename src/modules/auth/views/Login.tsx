import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {ArrowRight, LockKeyhole, Mail} from 'lucide-react';
import AuthBrand from '../components/AuthBrand';
import AuthShowcase from '../components/AuthShowcase';
import {Button} from '../../../shared/components/ui/Button';
import {Input} from '../../../shared/components/ui/Input';
import {getRequestErrorMessage, readApiError} from '../../../shared/lib/api';

const showcaseChips = ['Clientes', 'Produtos', 'Propostas'];

const showcaseMetrics = [
  {value: '01', label: 'Login'},
  {value: '02', label: 'Envio'},
  {value: '03', label: 'Retorno'},
];

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

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-black/8 bg-[#f7f3ec]/95 shadow-[0_30px_120px_rgba(12,12,12,0.12)] backdrop-blur lg:grid-cols-[0.92fr_1.08fr]">
          <section className="relative flex flex-col justify-center px-6 py-8 sm:px-10 lg:px-14 lg:py-10">
            <AuthBrand caption="Acesso comercial" className="mb-8" />

            <div className="max-w-md">
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#111111] sm:text-[4rem] sm:leading-[0.94]">
                Entrar
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-black/58 sm:text-base">
                Use seu email e senha para abrir sua central comercial.
              </p>
            </div>

            <form className="mt-7 max-w-md space-y-4" onSubmit={handleLogin}>
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
                    className="h-12 rounded-xl border-[#e7dfd2] bg-white/80 pl-11 pr-4 text-[15px] shadow-[0_12px_30px_rgba(17,17,17,0.05)] placeholder:text-[#9b9389] focus:border-[#b6a28d] focus:ring-[#b6a28d]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black/70">Senha</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                  <Input
                    type="password"
                    required
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-[#e7dfd2] bg-white/80 pl-11 pr-4 text-[15px] shadow-[0_12px_30px_rgba(17,17,17,0.05)] placeholder:text-[#9b9389] focus:border-[#b6a28d] focus:ring-[#b6a28d]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1 text-sm text-black/60">
                <label className="inline-flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-black/20 accent-black"
                  />
                  <span>Lembrar meu acesso</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="group h-12 w-full rounded-xl bg-[linear-gradient(135deg,#121212_0%,#1f2430_100%)] text-base font-semibold text-white shadow-[0_20px_35px_rgba(17,17,17,0.28)] hover:opacity-95"
              >
                <span>{loading ? 'Entrando...' : 'Entrar'}</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>

              <div className="border-t border-black/8 pt-5 text-sm text-black/58">
                <p>
                  Ainda nao tem conta?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-[#111111] transition-colors hover:text-[#5f5247]"
                  >
                    Criar acesso
                  </Link>
                </p>
              </div>
            </form>
          </section>

          <AuthShowcase
            title="Entre e continue suas propostas."
            description="Uma entrada mais limpa para voce chegar direto ao que importa."
            chips={showcaseChips}
            metrics={showcaseMetrics}
          />
        </div>
      </div>
    </div>
  );
}
