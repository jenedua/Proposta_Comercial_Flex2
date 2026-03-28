import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function ProposalForm() {
  const token = localStorage.getItem('flex_token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer_id: '',
    title: '',
    proposal_date: new Date().toISOString().split('T')[0],
    followup_date: '',
    notes: '',
  });

  const [items, setItems] = useState<any[]>([]);

  // Carregar Clientes para o Select
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await fetch('/api/customers', { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    }
  });

  // Carregar Produtos para facilitar preenchimento
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    }
  });

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // Auto-preencher preço se selecionar produto existente
    if (field === 'description') {
      const prod = products.find((p: any) => p.description === value);
      if (prod) {
        newItems[index].unit_price = prod.price;
        newItems[index].product_service_id = prod.id;
      }
    }

    // Recalcular total do item
    if (field === 'quantity' || field === 'unit_price' || field === 'description') {
      newItems[index].total_price = Number(newItems[index].quantity) * Number(newItems[index].unit_price);
    }

    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalValue = items.reduce((acc, item) => acc + item.total_price, 0);

  const createProposal = useMutation({
    mutationFn: async () => {
      const payload = { ...formData, total_value: totalValue, items };
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Erro ao criar proposta');
      return res.json();
    },
    onSuccess: () => {
      navigate('/proposals');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('Adicione pelo menos um item à proposta.');
    createProposal.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/proposals')} className="px-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Nova Proposta</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dados Principais */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Dados Gerais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
              <select 
                required
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={formData.customer_id}
                onChange={e => setFormData({...formData, customer_id: e.target.value})}
              >
                <option value="">Selecione um cliente...</option>
                {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título da Proposta *</label>
              <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: Desenvolvimento de Site" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data da Proposta *</label>
              <Input type="date" required value={formData.proposal_date} onChange={e => setFormData({...formData, proposal_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Follow-up</label>
              <Input type="date" value={formData.followup_date} onChange={e => setFormData({...formData, followup_date: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Itens da Proposta */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Itens da Proposta</h2>
          
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Descrição do Produto/Serviço</label>
                  <Input 
                    list="products-list"
                    value={item.description} 
                    onChange={e => handleItemChange(index, 'description', e.target.value)} 
                    placeholder="Digite ou selecione..."
                    required
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Qtd</label>
                  <Input type="number" min="1" step="0.01" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} required />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Valor Unit. (R$)</label>
                  <Input type="number" step="0.01" value={item.unit_price} onChange={e => handleItemChange(index, 'unit_price', e.target.value)} required />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Total (R$)</label>
                  <div className="h-10 flex items-center px-3 bg-gray-200 rounded-md font-medium text-gray-700">
                    {item.total_price.toFixed(2)}
                  </div>
                </div>
                <Button type="button" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3" onClick={() => handleRemoveItem(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <datalist id="products-list">
            {products.map((p: any) => <option key={p.id} value={p.description} />)}
          </datalist>

          <Button type="button" variant="outline" onClick={handleAddItem} className="w-full border-dashed gap-2">
            <Plus className="h-4 w-4" /> Adicionar Item
          </Button>

          <div className="flex justify-end pt-4 border-t mt-4">
            <div className="text-right">
              <span className="text-gray-500 mr-4">Valor Total da Proposta:</span>
              <span className="text-3xl font-bold text-blue-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
              </span>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Observações Adicionais</h2>
          <textarea 
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[100px]"
            placeholder="Termos, condições de pagamento, validade da proposta..."
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/proposals')}>Cancelar</Button>
          <Button type="submit" size="lg" disabled={createProposal.isPending}>
            {createProposal.isPending ? 'Salvando...' : 'Salvar Proposta'}
          </Button>
        </div>
      </form>
    </div>
  );
}
