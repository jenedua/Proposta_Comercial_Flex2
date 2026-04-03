import {useParams} from 'react-router-dom';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Button} from '../../../shared/components/ui/Button';
import {
  FileText,
  CheckCircle,
  XCircle,
  CalendarDays,
  CircleDollarSign,
  UserRound,
} from 'lucide-react';
import AuthBrand from '../../auth/components/AuthBrand';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR');

export default function PublicProposal() {
  const {uuid} = useParams();
  const queryClient = useQueryClient();

  const {data: proposal, isLoading, error} = useQuery({
    queryKey: ['publicProposal', uuid],
    queryFn: async () => {
      const res = await fetch(`/api/public/proposals/${uuid}`);
      if (!res.ok) throw new Error('Proposta nao encontrada');
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/public/proposals/${uuid}/status`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({status}),
      });
      if (!res.ok) throw new Error('Erro ao atualizar status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['publicProposal', uuid]});
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#ece8df_0%,#f4efe7_100%)] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl animate-pulse space-y-4">
          <div className="h-56 rounded-[32px] border border-black/8 bg-white/70" />
          <div className="h-20 rounded-[28px] border border-black/8 bg-white/60" />
          <div className="h-[320px] rounded-[32px] border border-black/8 bg-white/70" />
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#ece8df_0%,#f4efe7_100%)] px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-[32px] border border-black/8 bg-[#f7f3ec]/88 p-8 text-center shadow-[0_24px_80px_rgba(12,12,12,0.08)]">
          <div className="rounded-full border border-[#c85d4a]/12 bg-[#f7e7e2] p-4 text-[#b24b3b]">
            <XCircle className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[#111111]">
            Link invalido
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-black/56 sm:text-base">
            Esta proposta nao foi encontrada ou o link publico nao esta mais disponivel.
          </p>
        </div>
      </div>
    );
  }

  const isPending = proposal.status === 'draft' || proposal.status === 'sent';
  const isApproved = proposal.status === 'approved';
  const proposalDate = proposal.proposal_date ? dateFormatter.format(new Date(proposal.proposal_date)) : '--';

  const handleApprove = () => {
    if (window.confirm('Confirmar aprovacao da proposta?')) {
      updateStatus.mutate('approved');
    }
  };

  const handleReject = () => {
    if (window.confirm('Tem certeza que deseja reprovar esta proposta?')) {
      updateStatus.mutate('rejected');
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ece8df_0%,#f4efe7_100%)] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <section className="rounded-[32px] border border-black/8 bg-[#f7f3ec]/88 p-6 shadow-[0_24px_80px_rgba(12,12,12,0.08)] sm:p-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <AuthBrand caption="Proposta publica" className="mb-7" />

              <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/58 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-black/44">
                <FileText className="h-3.5 w-3.5" />
                Proposta #{proposal.sequential_number}
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[#111111] sm:text-[4rem] sm:leading-[0.94]">
                {proposal.company_name}
              </h1>

              <p className="mt-3 text-base text-black/58 sm:text-lg">{proposal.title}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-black/8 bg-white/58 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-black/36">
                    Preparado para
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="rounded-2xl bg-[#ebe6dd] p-3 text-black/55">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <p className="text-lg font-semibold text-[#111111]">{proposal.customer_name}</p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-black/8 bg-white/58 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-black/36">
                    Data da proposta
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="rounded-2xl bg-[#ebe6dd] p-3 text-black/55">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <p className="text-lg font-semibold text-[#111111]">{proposalDate}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full xl:max-w-sm">
              <div className="rounded-[28px] border border-black/8 bg-[linear-gradient(135deg,#151515_0%,#262933_100%)] p-6 text-white shadow-[0_20px_50px_rgba(17,17,17,0.18)]">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/45">
                  Valor total
                </p>
                <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">
                  {currencyFormatter.format(proposal.total_value)}
                </p>

                <div className="mt-5 flex items-center gap-3 rounded-[20px] border border-white/8 bg-white/[0.06] p-4">
                  <div className="rounded-2xl bg-white/10 p-3 text-white/75">
                    <CircleDollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/42">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-medium text-white/88">
                      {isPending
                        ? 'Aguardando resposta'
                        : isApproved
                          ? 'Proposta aprovada'
                          : 'Proposta reprovada'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {!isPending && (
          <section
            className={`rounded-[28px] border px-5 py-4 shadow-[0_16px_45px_rgba(12,12,12,0.05)] sm:px-6 ${
              isApproved
                ? 'border-[#bfe9ca] bg-[#edf9f0] text-[#17673a]'
                : 'border-[#efc7bf] bg-[#fcf0ed] text-[#a24f3d]'
            }`}
          >
            <div className="flex items-center gap-3">
              {isApproved ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <XCircle className="h-6 w-6" />
              )}
              <p className="text-base font-semibold sm:text-lg">
                Esta proposta foi {isApproved ? 'aprovada' : 'reprovada'}.
              </p>
            </div>
          </section>
        )}

        <section className="rounded-[32px] border border-black/8 bg-[#f7f3ec]/88 shadow-[0_24px_80px_rgba(12,12,12,0.08)]">
          <div className="border-b border-black/6 px-5 py-5 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
              Investimento
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-black/6 text-[11px] font-medium uppercase tracking-[0.22em] text-black/38">
                  <th className="px-5 py-4 sm:px-6">Descricao</th>
                  <th className="px-5 py-4 text-center sm:px-6">Qtd</th>
                  <th className="px-5 py-4 text-right sm:px-6">Valor unit.</th>
                  <th className="px-5 py-4 text-right sm:px-6">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/6">
                {proposal.items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 text-sm font-medium text-[#111111] sm:px-6 sm:text-base">
                      {item.description}
                    </td>
                    <td className="px-5 py-4 text-center text-sm text-black/58 sm:px-6">
                      {item.quantity}
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-black/58 sm:px-6">
                      {currencyFormatter.format(item.unit_price)}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-[#111111] sm:px-6 sm:text-base">
                      {currencyFormatter.format(item.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end border-t border-black/6 px-5 py-5 sm:px-6">
            <div className="rounded-[24px] border border-black/8 bg-white/62 px-5 py-4 text-right">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-black/36">
                Valor total
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-3xl">
                {currencyFormatter.format(proposal.total_value)}
              </p>
            </div>
          </div>
        </section>

        {proposal.notes && (
          <section className="rounded-[32px] border border-black/8 bg-[#f7f3ec]/88 p-5 shadow-[0_24px_80px_rgba(12,12,12,0.08)] sm:p-6">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
              Observacoes
            </h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-black/62 sm:text-base">
              {proposal.notes}
            </p>
          </section>
        )}

        {isPending && (
          <section className="rounded-[32px] border border-black/8 bg-[#f7f3ec]/88 p-5 shadow-[0_24px_80px_rgba(12,12,12,0.08)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-black/36">
                  Resposta
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
                  Escolha como deseja seguir
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-[#d9b3ab] bg-[#fcf0ed] text-[#9f4a3d] hover:border-[#c9978d] hover:bg-[#f9e5df] sm:w-auto"
                  onClick={handleReject}
                  disabled={updateStatus.isPending}
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Reprovar
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={handleApprove}
                  disabled={updateStatus.isPending}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Aprovar
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
