import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../shared/components/ui/Button';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

export default function PublicProposal() {
  const { uuid } = useParams();
  const queryClient = useQueryClient();

  const { data: proposal, isLoading, error } = useQuery({
    queryKey: ['publicProposal', uuid],
    queryFn: async () => {
      const res = await fetch(`/api/public/proposals/${uuid}`);
      if (!res.ok) throw new Error('Proposta não encontrada');
      return res.json();
    }
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/public/proposals/${uuid}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Erro ao atualizar status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicProposal', uuid] });
    }
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Carregando proposta...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-600">Proposta não encontrada ou link inválido.</div>;

  const isPending = proposal.status === 'draft' || proposal.status === 'sent';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header da Proposta */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{proposal.company_name}</h1>
          <p className="text-gray-500 text-lg">Proposta Comercial #{proposal.sequential_number}</p>
          <div className="mt-6 pt-6 border-t border-gray-100 text-left">
            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Preparado para</p>
            <p className="text-xl font-medium text-gray-900">{proposal.customer_name}</p>
            <p className="text-gray-600 mt-2 font-medium">{proposal.title}</p>
          </div>
        </div>

        {/* Status Banner */}
        {!isPending && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${proposal.status === 'approved' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {proposal.status === 'approved' ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            <span className="font-medium text-lg">
              Esta proposta foi {proposal.status === 'approved' ? 'Aprovada' : 'Reprovada'}.
            </span>
          </div>
        )}

        {/* Itens */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Investimento</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-sm text-gray-500">
                <th className="p-4 font-medium">Descrição</th>
                <th className="p-4 font-medium text-center">Qtd</th>
                <th className="p-4 font-medium text-right">Valor Unit.</th>
                <th className="p-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {proposal.items.map((item: any) => (
                <tr key={item.id}>
                  <td className="p-4 text-gray-900">{item.description}</td>
                  <td className="p-4 text-center text-gray-600">{item.quantity}</td>
                  <td className="p-4 text-right text-gray-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                  </td>
                  <td className="p-4 text-right font-medium text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={3} className="p-6 text-right font-semibold text-gray-600">Valor Total:</td>
                <td className="p-6 text-right font-bold text-2xl text-blue-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total_value)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Observações */}
        {proposal.notes && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Observações Adicionais</h2>
            <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">{proposal.notes}</p>
          </div>
        )}

        {/* Ações (Aprovar/Reprovar) */}
        {isPending && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 pb-12">
            <Button 
              size="lg" 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 w-full sm:w-auto"
              onClick={() => {
                if (window.confirm('Tem certeza que deseja reprovar esta proposta?')) updateStatus.mutate('rejected');
              }}
              disabled={updateStatus.isPending}
            >
              <XCircle className="h-5 w-5 mr-2" /> Reprovar Proposta
            </Button>
            
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 focus-visible:ring-green-600 w-full sm:w-auto"
              onClick={() => {
                if (window.confirm('Confirmar aprovação da proposta?')) updateStatus.mutate('approved');
              }}
              disabled={updateStatus.isPending}
            >
              <CheckCircle className="h-5 w-5 mr-2" /> Aprovar Proposta
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
