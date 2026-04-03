import {Link, useLocation, useNavigate} from 'react-router-dom';
import {LayoutDashboard, Users, FileText, Settings, LogOut, Package} from 'lucide-react';
import AuthBrand from '../../modules/auth/components/AuthBrand';
import {cn} from '../lib/utils';

const menuItems = [
  {icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard'},
  {icon: Users, label: 'Clientes', path: '/customers'},
  {icon: Package, label: 'Produtos', path: '/products'},
  {icon: FileText, label: 'Propostas', path: '/proposals'},
  {icon: Settings, label: 'Configuracoes', path: '/settings'},
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('flex_user') || '{}');
  const firstName = user?.name?.split?.(' ')?.[0] || 'Workspace';

  const handleLogout = () => {
    localStorage.removeItem('flex_token');
    localStorage.removeItem('flex_user');
    navigate('/login');
  };

  const renderNavLink = (compact = false) =>
    menuItems.map((item) => {
      const isActive = location.pathname.startsWith(item.path);

      return (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            'group flex items-center gap-3 transition-all',
            compact
              ? 'shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em]'
              : 'rounded-2xl px-4 py-3 text-sm font-medium',
            isActive
              ? compact
                ? 'border-[#111111] bg-[#111111] text-white shadow-[0_10px_25px_rgba(17,17,17,0.18)]'
                : 'bg-[#111111] text-white shadow-[0_18px_40px_rgba(17,17,17,0.16)]'
              : compact
                ? 'border-black/10 bg-white/60 text-black/60 hover:bg-white hover:text-black'
                : 'text-black/58 hover:bg-white/65 hover:text-black',
          )}
        >
          <item.icon
            className={cn(
              compact ? 'h-4 w-4' : 'h-4.5 w-4.5',
              isActive ? 'text-current' : 'text-black/36 group-hover:text-black/55',
            )}
          />
          <span>{item.label}</span>
        </Link>
      );
    });

  return (
    <>
      <div className="lg:hidden">
        <div className="px-4 pt-4 sm:px-6">
          <div className="rounded-[26px] border border-black/8 bg-[#f7f3ec]/88 p-4 shadow-[0_18px_60px_rgba(12,12,12,0.08)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <AuthBrand caption="Painel comercial" />
                <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.22em] text-black/35">
                  Sessao ativa
                </p>
                <p className="mt-1 text-sm font-semibold text-black/72">{firstName}</p>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-full border border-black/10 bg-white/60 p-2.5 text-black/55 transition-colors hover:bg-white hover:text-black"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">{renderNavLink(true)}</nav>
          </div>
        </div>
      </div>

      <aside className="fixed bottom-4 left-4 top-4 z-20 hidden w-[264px] flex-col rounded-[30px] border border-black/8 bg-[#f7f3ec]/88 p-4 shadow-[0_24px_80px_rgba(12,12,12,0.08)] backdrop-blur lg:flex">
        <div className="border-b border-black/6 pb-5">
          <AuthBrand caption="Painel comercial" />

          <div className="mt-5 rounded-[24px] border border-black/8 bg-white/58 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-black/35">
              Sessao ativa
            </p>
            <p className="mt-2 text-sm font-semibold text-black/78">{firstName}</p>
            <p className="mt-1 text-sm text-black/45">{user?.email || 'Acesso autenticado'}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto py-5">{renderNavLink()}</nav>

        <div className="border-t border-black/6 pt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl border border-black/8 bg-white/58 px-4 py-3 text-sm font-medium text-black/60 transition-colors hover:bg-white hover:text-[#9a3f2f]"
          >
            <LogOut className="h-4.5 w-4.5 text-black/38" />
            Sair do sistema
          </button>
        </div>
      </aside>
    </>
  );
}
