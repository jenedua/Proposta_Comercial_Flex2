import React from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Package, Plus, Tag } from 'lucide-react';

export default function Products() {
  const token = localStorage.getItem('flex_token');
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ type: 'product', description: '', price: '' });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Erro ao buscar produtos');
      return res.json();
    }
  });

  const createProduct = useMutation({
    mutationFn: async (newProduct: any) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newProduct, price: parseFloat(newProduct.price) || 0 })
      });
      if (!res.ok) throw new Error('Erro ao criar produto');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsAdding(false);
      setFormData({ type: 'product', description: '', price: '' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" /> Produtos e Serviços
          </h1>
          <p className="text-gray-500 mt-1">Catálogo base para suas propostas.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Item
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Cadastrar Novo Item</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select 
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="product">Produto</option>
                <option value="service">Serviço</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
              <Input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ex: Consultoria de Marketing" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Padrão (R$)</label>
              <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
            </div>
            <div className="md:col-span-4 flex justify-end gap-2 mt-2">
              <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
              <Button type="submit" disabled={createProduct.isPending}>
                {createProduct.isPending ? 'Salvando...' : 'Salvar Item'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
              <th className="p-4 font-medium">Tipo</th>
              <th className="p-4 font-medium">Descrição</th>
              <th className="p-4 font-medium text-right">Valor Base</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500">Carregando...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500">Nenhum item cadastrado no catálogo.</td></tr>
            ) : (
              products.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${p.type === 'product' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'}`}>
                      <Tag className="h-3 w-3" />
                      {p.type === 'product' ? 'Produto' : 'Serviço'}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-900">{p.description}</td>
                  <td className="p-4 text-right font-medium text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
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
