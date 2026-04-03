import {useQuery} from '@tanstack/react-query';
import {Users, FileText, CheckCircle, Clock, MessageCircle, ExternalLink} from 'lucide-react';
import {Button} from '../../../shared/components/ui/Button';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {format, parseISO} from 'date-fns';
import {ptBR} from 'date-fns/locale';

const overviewConfig = [
  {
    key: 'totalCustomers',
    title: 'Clientes',
    icon: Users,
    iconWrap: 'bg-[#e9efff]',
    iconColor: 'text-[#4a67e8]',
  },
  {
    key: 'totalProposals',
    title: 'Criadas',
    icon: FileText,
    iconWrap: 'bg-[#efebe4]',
    iconColor: 'text-[#6b5b4b]',
  },
  {
    key: 'approvedProposals',
    title: 'Aprovadas',
    icon: CheckCircle,
    iconWrap: 'bg-[#e7f4ea]',
    iconColor: 'text-[#2d8a4c]',
  },
  {
    key: 'pendingProposals',
    title: 'Pendentes',
    icon: Clock,
    iconWrap: 'bg-[#f8ede4]',
    iconColor: 'text-[#d06a2f]',
  },
];

export default function Dashboard() {
  const token = localStorage.getItem('flex_token');
  const user = JSON.parse(localStorage.getItem('flex_user') || '{}');
  const firstName = user?.name?.split?.(' ')?.[0] || 'Operador';

  const {data: stats, isLoading} = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats', {
        headers: {Authorization: `Bearer ${token}`},
      });
      if (!res.ok) throw new Error('Erro ao buscar dados');
      return res.json();
    },
  });

  const {data: settings} = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings', {
        headers: {Authorization: `Bearer ${token}`},
      });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleWhatsApp = (proposal: any) => {
    if (!proposal.customer_phone) {
      alert('Cliente nao possui telefone cadastrado.');
      return;
    }

    let text = settings?.whatsapp_default_text || 'Ola #CLIENTE#, segue sua proposta: #LINK#';
    const link = `${window.location.origin}/p/${proposal.public_link_uuid}`;
    const valor = formatCurrency(proposal.total_value);

    text = text
      .replace(/#CLIENTE#/g, proposal.customer_name)
      .replace(/#PROPOSTA#/g, `#${proposal.sequential_number}`)
      .replace(/#VALOR#/g, valor)
      .replace(/#LINK#/g, link);

    const phone = proposal.customer_phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const chartData = (stats?.chartData || []).map((item: any) => {
    const date = parseISO(`${item.month}-01`);
    return {
      name: format(date, 'MMM/yy', {locale: ptBR}),
      total: item.total,
    };
  });

  const followUps = stats?.followUps || [];

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-56 rounded-[30px] border border-black/8 bg-white/60" />
        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="h-[360px] rounded-[30px] border border-black/8 bg-white/60" />
          <div className="h-[360px] rounded-[30px] border border-black/8 bg-white/60" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[30px] border border-black/8 bg-[#f7f3ec]/82 p-6 shadow-[0_18px_60px_rgba(12,12,12,0.06)] sm:p-7">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-black/35">
              Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#111111] sm:text-[3.8rem] sm:leading-[0.95]">
              Ola, {firstName}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-black/58 sm:text-base">
              Um resumo mais limpo do seu comercial, com foco em clientes, propostas e retornos.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-black/8 bg-white/62 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-black/52">
                {stats?.totalCustomers || 0} clientes
              </span>
              <span className="rounded-full border border-black/8 bg-white/62 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-black/52">
                {stats?.totalProposals || 0} propostas
              </span>
              <span className="rounded-full border border-black/8 bg-white/62 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-black/52">
                {followUps.length} follow-ups hoje
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {overviewConfig.map((item) => (
              <div
                key={item.key}
                className="rounded-[24px] border border-black/8 bg-white/68 p-4 shadow-[0_12px_30px_rgba(12,12,12,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-black/35">
                      {item.title}
                    </p>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#111111]">
                      {stats?.[item.key] || 0}
                    </p>
                  </div>

                  <div className={`rounded-2xl p-3 ${item.iconWrap}`}>
                    <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.28fr_0.72fr]">
        <div className="rounded-[30px] border border-black/8 bg-[#f7f3ec]/82 p-5 shadow-[0_18px_60px_rgba(12,12,12,0.06)] sm:p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-black/35">
                Performance
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
                Aprovado nos ultimos 6 meses
              </h3>
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData} margin={{top: 8, right: 8, left: -12, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd5ca" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#736a61', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#736a61', fontSize: 12}}
                    tickFormatter={(value) =>
                      `R$ ${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`
                    }
                  />
                  <Tooltip
                    cursor={{fill: '#ece5da'}}
                    formatter={(value: number) => [formatCurrency(value), 'Aprovado']}
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid rgba(17,17,17,0.06)',
                      background: '#fffaf2',
                      boxShadow: '0 12px 30px rgba(12,12,12,0.08)',
                    }}
                  />
                  <Bar dataKey="total" fill="#5f78ec" radius={[8, 8, 0, 0]} maxBarSize={58} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center rounded-[24px] border border-dashed border-black/8 bg-white/35 text-center text-sm text-black/42">
              <p className="text-base font-medium text-black/55">Sem historico suficiente</p>
              <p className="mt-2 max-w-xs leading-6">
                Quando houver propostas aprovadas, o grafico aparece aqui.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-[30px] border border-black/8 bg-[#f7f3ec]/82 p-5 shadow-[0_18px_60px_rgba(12,12,12,0.06)] sm:p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-black/35">
                Hoje
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
                Follow-ups
              </h3>
            </div>

            <span className="rounded-full border border-black/8 bg-white/62 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-black/52">
              {followUps.length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto pr-1 xl:max-h-[300px]">
            {followUps.length > 0 ? (
              followUps.map((proposal: any) => (
                <div
                  key={proposal.id}
                  className="rounded-[24px] border border-black/8 bg-white/68 p-4 shadow-[0_12px_30px_rgba(12,12,12,0.04)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-black/38">
                        Proposta #{proposal.sequential_number}
                      </p>
                      <h4 className="mt-2 text-base font-semibold text-[#111111]">
                        {proposal.customer_name}
                      </h4>
                      <p className="mt-1 text-sm text-black/48">{proposal.title}</p>
                    </div>

                    <span className="text-sm font-semibold text-[#111111]">
                      {formatCurrency(proposal.total_value)}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="h-10 flex-1 rounded-xl bg-[#111111] px-4 text-sm font-medium text-white hover:opacity-95"
                      onClick={() => handleWhatsApp(proposal)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Enviar
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 rounded-xl border-black/10 bg-white/75 px-3 text-black/68 hover:bg-white"
                      onClick={() => window.open(`/p/${proposal.public_link_uuid}`, '_blank')}
                      title="Abrir proposta"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center rounded-[24px] border border-dashed border-black/8 bg-white/35 text-center text-sm text-black/42">
                <CheckCircle className="h-8 w-8 text-black/24" />
                <p className="mt-4 text-base font-medium text-black/55">Nada agendado por agora</p>
                <p className="mt-2 max-w-xs leading-6">
                  Seus proximos contatos do dia vao aparecer aqui.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
