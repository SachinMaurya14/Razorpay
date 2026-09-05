import React from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Layers, 
  Bot, 
  BarChart3, 
  FileText, 
  Sliders, 
  Zap,
  HelpCircle,
  Database,
  Activity
} from 'lucide-react';

export type AppView = 
  | 'overview' 
  | 'incidents' 
  | 'incident-detail' 
  | 'recovery'
  | 'transactions' 
  | 'agents' 
  | 'agent-performance'
  | 'analytics' 
  | 'audit-log' 
  | 'guide';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  activeIncidentsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  activeIncidentsCount = 0,
}) => {
  const navItems = [
    {
      id: 'overview' as AppView,
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'incidents' as AppView,
      label: 'Revenue Incidents',
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: activeIncidentsCount > 0 ? activeIncidentsCount : undefined,
    },
    {
      id: 'recovery' as AppView,
      label: 'Recovery Ops',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: 'transactions' as AppView,
      label: 'Live Telemetry',
      icon: <Database className="w-4 h-4" />,
    },
    {
      id: 'agents' as AppView,
      label: 'Agent Command',
      icon: <Bot className="w-4 h-4" />,
    },
    {
      id: 'agent-performance' as AppView,
      label: 'Agent Performance',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'analytics' as AppView,
      label: 'Recovery Intelligence',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'audit-log' as AppView,
      label: 'Audit & Governance',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'guide' as AppView,
      label: 'Product Architecture',
      icon: <HelpCircle className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-60 border-r border-slate-800 bg-[#0c111d] p-3.5 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
          Platform Navigation
        </div>

        {navItems.map((item) => {
          const isActive = currentView === item.id || (item.id === 'incidents' && currentView === 'incident-detail');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
