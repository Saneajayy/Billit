import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { UserButton, useAuth } from '@clerk/clerk-react';
import { LayoutDashboard, Users, Package, FileText, Bot, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
  { name: 'AI Assistant', href: '/dashboard/assistant', icon: Bot },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout() {
  const location = useLocation();
  const { getToken } = useAuth();

  const { isLoading, isError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => fetchApi('/onboarding', { method: 'GET' }, getToken),
    retry: false, // Don't retry on 404
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // If we fail to fetch the user profile (e.g. 404 User not found), redirect to onboarding
  if (isError) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-slate-200 flex selection:bg-purple-500/30">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-[#131316] border-r border-white/5">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Billit</span>
              <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">GST</span>
            </div>
            <nav className="mt-8 flex-1 px-3 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      isActive ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent',
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all'
                    )}
                  >
                    <item.icon
                      className={classNames(
                        isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-400',
                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-white/5 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Account</p>
                  <p className="text-xs font-medium text-slate-500 group-hover:text-slate-400 transition-colors">Manage profile</p>
                </div>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1 w-full">
        {/* Mobile topbar */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-[#131316] border-b border-white/5 flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Billit</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
        
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
