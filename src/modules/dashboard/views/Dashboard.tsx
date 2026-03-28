import { useQuery } from '@tanstack/react-query';
import { Users, FileText, CheckCircle, Clock, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const token = localStorage.getItem('flex_token');
  const user = JSON.parse(localStorage.getItem('flex_user') || '{}');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro ao buscar dados');
      return res.json();
    }
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return null;
      return res.json();
    }
  });

  const statCards = [
    { title: 'Total de Clientes', value: stats?.totalCustomers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Propostas Criadas', value: stats?.totalProposals || 0, icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50' },
    { title: 'Propostas Aprovadas', value: stats?.approvedProposals || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Propostas Pendentes', value: stats?.pendingProposals || 0, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleWhatsApp = (proposal: any) => {
    if (!proposal.customer_phone) {
      alert('Cliente não possui telefone cadastrado.');
      return;
    }
    
    let text = settings?.whatsapp_default_text || 'Olá #CLIENTE#, segue sua proposta: #LINK#';
    const link = `${window.location.origin}/p/${proposal.public_link_uuid}`;
    const valor = formatCurrency(proposal.total_value);
    
    text = text.replace(/#CLIENTE#/g, proposal.customer_name)
               .replace(/#PROPOSTA#/g, `#${proposal.sequential_number}`)
               .replace(/#VALOR#/g, valor)
               .replace(/#LINK#/g, link);

    const phone = proposal.customer_phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Format chart data
  const chartData = (stats?.chartData || []).map((item: any) => {
    const date = parseISO(`${item.month}-01`);
    return {
      name: format(date, 'MMM/yy', { locale: ptBR }),
      total: item.total
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Olá, {user.name?.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-1">Aqui está o resumo do seu negócio hoje.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 h-32"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Valor Aprovado (Últimos 6 meses)</h3>
          {chartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    formatter={(value: number) => [formatCurrency(value), 'Valor Aprovado']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm text-center">
              <BarChart className="h-8 w-8 mb-2 text-gray-300" />
              Sem dados suficientes para gerar o gráfico.
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" /> Follow-ups de Hoje
          </h3>
          
          <div className="space-y-4 overflow-y-auto max-h-[320px] pr-2">
            {stats?.followUps?.length > 0 ? (
              stats.followUps.map((proposal: any) => (
                <div key={proposal.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">#{proposal.sequential_number}</span>
                      <h4 className="font-medium text-gray-900 mt-1">{proposal.customer_name}</h4>
                    </div>
                    <span className="font-semibold text-gray-900">{formatCurrency(proposal.total_value)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 truncate">{proposal.title}</p>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="w-full gap-2" onClick={() => handleWhatsApp(proposal)}>
                      <MessageCircle className="h-4 w-4" /> Enviar
                    </Button>
                    <Button variant="outline" size="sm" className="px-3" onClick={() => window.open(`/p/${proposal.public_link_uuid}`, '_blank')} title="Ver Link">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm text-center">
                <CheckCircle className="h-8 w-8 mb-2 text-gray-300" />
                Nenhum follow-up agendado para hoje.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

