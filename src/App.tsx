import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './shared/components/Layout';
import Login from './modules/auth/views/Login';
import Register from './modules/auth/views/Register';
import Dashboard from './modules/dashboard/views/Dashboard';
import Customers from './modules/customers/views/Customers';
import Products from './modules/products/views/Products';
import Proposals from './modules/proposals/views/Proposals';
import ProposalForm from './modules/proposals/views/ProposalForm';
import PublicProposal from './modules/proposals/views/PublicProposal';
import Settings from './modules/settings/views/Settings';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rota Pública da Proposta */}
          <Route path="/p/:uuid" element={<PublicProposal />} />

          {/* Rotas Logadas */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="products" element={<Products />} />
            <Route path="proposals" element={<Proposals />} />
            <Route path="proposals/new" element={<ProposalForm />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}


