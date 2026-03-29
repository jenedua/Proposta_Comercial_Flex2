import React from 'react';
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
import {Button} from '../../../shared/components/ui/Button';
import {Input} from '../../../shared/components/ui/Input';
import {getRequestErrorMessage, readApiError} from '../../../shared/lib/api';

const steps = [
  {id: 1, label: 'Conta'},
  {id: 2, label: 'Empresa'},
  {id: 3, label: 'Seguranca'},
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
  const [marketingOptIn, setMarketingOptIn] = useState(false);
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
    <div className="relative min-h-screen overflow-hidden bg-[#151b29] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(112,174,255,0.1),transparent_22%),linear-gradient(180deg,#151b29_0%,#141927_50%,#182033_100%)]" />
        <div className="absolute bottom-[-16%] left-1/2 h-[460px] w-[860px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(95,135,255,0.2),transparent_62%)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,transparent_0%,rgba(94,121,192,0.14)_100%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-10 sm:px-6">
        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#77b4ff]/30 bg-[linear-gradient(90deg,rgba(83,145,255,0.85),rgba(108,205,255,0.7))] px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white/95 shadow-[0_12px_30px_rgba(58,120,255,0.22)] transition-transform hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para login
        </Link>

        <div className="w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,22,35,0.92),rgba(19,25,40,0.88))] shadow-[0_28px_100px_rgba(0,0,0,0.38)] backdrop-blur">
          <div className="border-b border-white/6 px-6 py-7 sm:px-10">
            <AuthBrand tone="dark" caption="Workspace comercial premium" centered className="mb-7" />

            <div className="mb-8 flex items-center justify-center gap-3">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                        step.id === 1
                          ? 'bg-[linear-gradient(180deg,#7ab8ff_0%,#5d8eff_100%)] text-white shadow-[0_8px_20px_rgba(90,142,255,0.35)]'
                          : 'bg-white/8 text-white/75'
                      }`}
                    >
                      {step.id}
                    </div>
                    <span className="hidden text-[10px] uppercase tracking-[0.18em] text-white/35 sm:block">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && <div className="mb-6 h-px w-10 bg-white/18 sm:w-14" />}
                </React.Fragment>
              ))}
            </div>

            <div className="text-center">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.28em] text-[#8cbdfc]">Criacao de conta</p>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Vamos configurar seu acesso
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/58 sm:text-base">
                Preencha os dados da sua empresa e entre no mesmo ecossistema visual da sua area comercial.
              </p>
            </div>
          </div>

          <form className="space-y-5 px-6 py-7 sm:px-10 sm:py-8" onSubmit={handleRegister}>
            {error && (
              <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/72">Seu nome</label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    required
                    placeholder="Joao Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-14 rounded-2xl border-white/10 bg-white/7 pl-11 pr-4 text-[15px] text-white placeholder:text-white/28 focus:border-[#79a8ff] focus:ring-[#79a8ff]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/72">Empresa</label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    required
                    placeholder="Sua empresa"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    className="h-14 rounded-2xl border-white/10 bg-white/7 pl-11 pr-4 text-[15px] text-white placeholder:text-white/28 focus:border-[#79a8ff] focus:ring-[#79a8ff]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/72">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input
                  type="email"
                  required
                  placeholder="voce@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="h-14 rounded-2xl border-white/10 bg-white/7 pl-11 pr-4 text-[15px] text-white placeholder:text-white/28 focus:border-[#79a8ff] focus:ring-[#79a8ff]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/72">WhatsApp</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input
                  required
                  placeholder="(11) 99999-9999"
                  value={formData.whatsapp}
                  onChange={handlePhoneChange}
                  className="h-14 rounded-2xl border-white/10 bg-white/7 pl-11 pr-4 text-[15px] text-white placeholder:text-white/28 focus:border-[#79a8ff] focus:ring-[#79a8ff]"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/72">Senha</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    type="password"
                    required
                    placeholder="Min. 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="h-14 rounded-2xl border-white/10 bg-white/7 pl-11 pr-4 text-[15px] text-white placeholder:text-white/28 focus:border-[#79a8ff] focus:ring-[#79a8ff]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/72">Confirmar senha</label>
                <div className="relative">
                  <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    type="password"
                    required
                    placeholder="Repita a senha"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                    className="h-14 rounded-2xl border-white/10 bg-white/7 pl-11 pr-4 text-[15px] text-white placeholder:text-white/28 focus:border-[#79a8ff] focus:ring-[#79a8ff]"
                  />
                </div>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-sm text-white/62">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-transparent accent-[#6da8ff]"
              />
              <span>
                Quero receber novidades, dicas e melhorias do Proposta Flex por email.
              </span>
            </label>

            <Button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-2xl border-0 bg-[linear-gradient(90deg,#6a5cff_0%,#5d89ff_52%,#67d0ff_100%)] text-sm font-semibold tracking-[0.02em] text-white shadow-[0_18px_40px_rgba(84,112,255,0.28)] hover:opacity-95"
            >
              <span>{loading ? 'Criando conta...' : 'Criar conta e enviar verificacao'}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="flex flex-col items-center gap-3 pt-1 text-center">
              <p className="text-sm text-white/58">
                Ja possui acesso?{' '}
                <Link to="/login" className="font-semibold text-[#8ac1ff] transition-colors hover:text-white">
                  Entrar agora
                </Link>
              </p>
              <p className="text-xs uppercase tracking-[0.22em] text-white/28">
                Cadastro pronto para desktop e mobile
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
