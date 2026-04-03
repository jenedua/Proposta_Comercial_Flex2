import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import AuthBrand from '../components/AuthBrand';
import AuthShowcase from '../components/AuthShowcase';
import {Button} from '../../../shared/components/ui/Button';
import {Input} from '../../../shared/components/ui/Input';
import {getRequestErrorMessage, readApiError} from '../../../shared/lib/api';

const showcaseChips = ['Conta', 'Empresa', 'Propostas'];

const showcaseMetrics = [
  {value: '01', label: 'Conta'},
  {value: '02', label: 'Equipe'},
  {value: '03', label: 'Pronto'},
];

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_name: '',
    name: '',
    email: '',
    whatsapp: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    }

    setFormData({...formData, whatsapp: value});
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      return setError('A senha deve ter no minimo 6 caracteres.');
    }
    if (formData.password !== formData.confirm_password) {
      return setError('As senhas nao conferem.');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, 'Erro ao criar conta.'));
      }

      navigate('/login');
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
        <div className="grid w-full overflow-hidden rounded-[32px] border border-black/8 bg-[#f7f3ec]/95 shadow-[0_30px_120px_rgba(12,12,12,0.12)] backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
          <section className="relative flex flex-col justify-center px-6 py-8 sm:px-10 lg:px-14 lg:py-10">
            <Link
              to="/login"
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-black/60 transition-colors hover:bg-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar
            </Link>

            <AuthBrand caption="Criar acesso" className="mb-8" />

            <div className="max-w-lg">
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#111111] sm:text-[4rem] sm:leading-[0.94]">
                Criar conta
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-black/58 sm:text-base">
                Configure sua empresa e comece a enviar propostas.
              </p>
            </div>

            <form className="mt-7 max-w-lg space-y-4" onSubmit={handleRegister}>
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 shadow-sm">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/70">Seu nome</label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                    <Input
                      required
                      placeholder="Joao Silva"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="h-12 rounded-xl border-[#e7dfd2] bg-white/80 pl-11 pr-4 text-[15px] shadow-[0_12px_30px_rgba(17,17,17,0.05)] placeholder:text-[#9b9389] focus:border-[#b6a28d] focus:ring-[#b6a28d]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/70">Empresa</label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                    <Input
                      required
                      placeholder="Sua empresa"
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      className="h-12 rounded-xl border-[#e7dfd2] bg-white/80 pl-11 pr-4 text-[15px] shadow-[0_12px_30px_rgba(17,17,17,0.05)] placeholder:text-[#9b9389] focus:border-[#b6a28d] focus:ring-[#b6a28d]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/70">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                    <Input
                      type="email"
                      required
                      placeholder="voce@empresa.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="h-12 rounded-xl border-[#e7dfd2] bg-white/80 pl-11 pr-4 text-[15px] shadow-[0_12px_30px_rgba(17,17,17,0.05)] placeholder:text-[#9b9389] focus:border-[#b6a28d] focus:ring-[#b6a28d]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/70">WhatsApp</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                    <Input
                      required
                      placeholder="(11) 99999-9999"
                      value={formData.whatsapp}
                      onChange={handlePhoneChange}
                      className="h-12 rounded-xl border-[#e7dfd2] bg-white/80 pl-11 pr-4 text-[15px] shadow-[0_12px_30px_rgba(17,17,17,0.05)] placeholder:text-[#9b9389] focus:border-[#b6a28d] focus:ring-[#b6a28d]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/70">Senha</label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                    <Input
                      type="password"
                      required
                      placeholder="Min. 6 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="h-12 rounded-xl border-[#e7dfd2] bg-white/80 pl-11 pr-4 text-[15px] shadow-[0_12px_30px_rgba(17,17,17,0.05)] placeholder:text-[#9b9389] focus:border-[#b6a28d] focus:ring-[#b6a28d]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/70">Confirmar senha</label>
                  <div className="relative">
                    <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                    <Input
                      type="password"
                      required
                      placeholder="Repita a senha"
                      value={formData.confirm_password}
                      onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                      className="h-12 rounded-xl border-[#e7dfd2] bg-white/80 pl-11 pr-4 text-[15px] shadow-[0_12px_30px_rgba(17,17,17,0.05)] placeholder:text-[#9b9389] focus:border-[#b6a28d] focus:ring-[#b6a28d]"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="group h-12 w-full rounded-xl bg-[linear-gradient(135deg,#121212_0%,#1f2430_100%)] text-base font-semibold text-white shadow-[0_20px_35px_rgba(17,17,17,0.28)] hover:opacity-95"
              >
                <span>{loading ? 'Criando conta...' : 'Criar conta'}</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>

              <div className="border-t border-black/8 pt-5 text-sm text-black/58">
                <p>
                  Ja possui acesso?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-[#111111] transition-colors hover:text-[#5f5247]"
                  >
                    Entrar
                  </Link>
                </p>
              </div>
            </form>
          </section>

          <AuthShowcase
            title="Crie seu acesso e comece a operar."
            description="Um cadastro mais rapido para colocar seu workspace comercial em movimento."
            chips={showcaseChips}
            metrics={showcaseMetrics}
          />
        </div>
      </div>
    </div>
  );
}
