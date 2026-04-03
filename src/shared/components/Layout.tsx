import {Navigate, Outlet} from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const token = localStorage.getItem('flex_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ece8df_0%,#efe9df_36%,#f6f2eb_100%)] text-[#161616]">
      <Sidebar />
      <main className="min-h-screen lg:pl-[18.5rem]">
        <div className="mx-auto max-w-[1500px] px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
