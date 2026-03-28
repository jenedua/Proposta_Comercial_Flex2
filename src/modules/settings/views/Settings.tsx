import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../shared/components/ui/Button';
import { Settings as SettingsIcon, MessageCircle } from 'lucide-react';

export default function Settings() {
  const token = localStorage.getItem('flex_token');
  const queryClient = useQueryClient();
  const [whatsappText, setWhatsappText] = useState('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Erro ao buscar configurações');
      return res.json();
    }
  });

  useEffect(() => {
    if (settings) {
      setWhatsappText(settings.whatsapp_default_text);
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ whatsapp_default_text: whatsappText })
      });
      if (!res.ok) throw new Error('Erro ao salvar configurações');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      alert('Configurações salvas com sucesso!');
    }
  });

  if (isLoading) return <div>Carregando configurações...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-blue-600" /> Configurações
        </h1>
        <p className="text-gray-500 mt-1">Gerencie as preferências da sua conta.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4 border-b pb-2">
            <MessageCircle className="h-5 w-5 text-green-500" /> Texto Padrão do WhatsApp
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Configure a mensagem que será enviada ao cliente ao compartilhar a proposta.
            Você pode usar as seguintes variáveis dinâmicas:
          </p>
          <ul className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md mb-4 space-y-1 font-mono">
            <li><span className="font-bold text-blue-600">#CLIENTE#</span> - Nome do cliente</li>
            <li><span className="font-bold text-blue-600">#PROPOSTA#</span> - Número da proposta</li>
            <li><span className="font-bold text-blue-600">#VALOR#</span> - Valor total formatado</li>
            <li><span className="font-bold text-blue-600">#LINK#</span> - Link público da proposta</li>
          </ul>

          <textarea 
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[120px]"
            value={whatsappText}
            onChange={e => setWhatsappText(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={() => updateSettings.mutate()} 
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </div>
  );
}
