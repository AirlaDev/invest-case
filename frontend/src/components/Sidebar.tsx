'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BarChart3, 
  TrendingUp, 
  ArrowLeftRight,
  LogOut 
} from 'lucide-react';

const routes = [
  {
    label: 'Clientes',
    icon: Users,
    href: '/dashboard/clients',
    color: 'text-sky-500',
  },
  {
    label: 'Ativos',
    icon: TrendingUp,
    href: '/dashboard/assets', 
    color: 'text-emerald-500',
  },
  {
    label: 'Movimentações',
    icon: ArrowLeftRight,
    href: '/dashboard/movements',
    color: 'text-violet-500',
  },
  {
    label: 'Dashboard',
    icon: BarChart3,
    href: '/dashboard',
    color: 'text-pink-500',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold">InvestCase</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition',
                pathname === route.href ? 'text-white bg-white/10' : 'text-zinc-400'
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-auto px-3">
        <Button 
          onClick={handleLogout}
          variant="outline" 
          className="w-full justify-start text-white border-white/20 hover:bg-white/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
}