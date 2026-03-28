import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/Button';
import { FileText, Plus, ExternalLink, MessageCircle } from 'lucide-react';

export default function Proposals() {
  const token = localStorage.getItem('flex_token');

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const res = await fetch('/api/proposals', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Erro ao buscar propostas');
      return res.json();
    }
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    }
  });

  const getStatusBadge = (status: string) => {
    const styles: any = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const labels: any = {
      draft: 'Rascunho', sent: 'Enviada', approved: 'Aprovada', rejected: 'Reprovada'
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
  };

  const handleWhatsApp = (proposal: any) => {
    if (!proposal.customer_phone) {
      alert('Cliente não possui telefone cadastrado.');
      return;
    }
    
    let text = settings?.whatsapp_default_text || 'Olá #CLIENTE#, segue sua proposta: #LINK#';
    const link = `${window.location.origin}/p/${proposal.public_link_uuid}`;
    const valor = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total_value);
    
    text = text.replace(/#CLIENTE#/g, proposal.customer_name)
               .replace(/#PROPOSTA#/g, `#${proposal.sequential_number}`)
               .replace(/#VALOR#/g, valor)
               .replace(/#LINK#/g, link);

    const phone = proposal.customer_phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" /> Propostas
          </h1>
          <p className="text-gray-500 mt-1">Gerencie e acompanhe suas propostas comerciais.</p>
        </div>
        <Link to="/proposals/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Nova Proposta
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
              <th className="p-4 font-medium">Nº</th>
              <th className="p-4 font-medium">Cliente / Título</th>
              <th className="p-4 font-medium">Valor Total</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Follow-up</th>
              <th className="p-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Carregando...</td></tr>
            ) : proposals.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhuma proposta encontrada.</td></tr>
            ) : (
              proposals.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">#{p.sequential_number}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{p.customer_name}</div>
                    <div className="text-sm text-gray-500">{p.title}</div>
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.total_value)}
                  </td>
                  <td className="p-4">{getStatusBadge(p.status)}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {p.followup_date ? new Date(p.followup_date).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => window.open(`/p/${p.public_link_uuid}`, '_blank')} title="Ver Link Público">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleWhatsApp(p)} title="Enviar por WhatsApp">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
