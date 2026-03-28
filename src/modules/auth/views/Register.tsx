import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { FileText } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_name: '',
    name: '',
    email: '',
    whatsapp: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Máscara simples de WhatsApp (xx) xxxxx-xxxx
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
    
    setFormData({ ...formData, whatsapp: value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      return setError('A senha deve ter no mínimo 6 caracteres.');
    }
    if (formData.password !== formData.confirm_password) {
      return setError('As senhas não conferem.');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar conta');

      // Redireciona para login após sucesso
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 text-blue-600 mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Criar nova conta</h2>
          <p className="mt-2 text-sm text-gray-600">Comece a enviar propostas profissionais hoje</p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
            <Input 
              required 
              placeholder="Sua Empresa LTDA"
              value={formData.company_name}
              onChange={(e) => setFormData({...formData, company_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
            <Input 
              required 
              placeholder="João Silva"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <Input 
                type="email" 
                required 
                placeholder="email@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <Input 
                required 
                placeholder="(11) 99999-9999"
                value={formData.whatsapp}
                onChange={handlePhoneChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <Input 
                type="password" 
                required 
                placeholder="Mín. 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
              <Input 
                type="password" 
                required 
                placeholder="Repita a senha"
                value={formData.confirm_password}
                onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar minha conta'}
          </Button>
          
          <div className="text-center text-sm mt-4">
            <span className="text-gray-600">Já tem uma conta? </span>
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Fazer login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
