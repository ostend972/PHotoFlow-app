import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderPlus, 
  FolderOpen, 
  Users, 
  UserCircle, 
  LayoutTemplate, 
  Settings,
  Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  onCloseMobile?: () => void;
  className?: string;
}

export function Sidebar({ onCloseMobile, className }: SidebarProps) {
  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/new-project", icon: FolderPlus, label: "Nouveau Projet" },
    { to: "/projects", icon: FolderOpen, label: "Projets" },
    { to: "/clients", icon: Users, label: "Clients" },
    { to: "/models", icon: UserCircle, label: "Modèles" },
    { to: "/templates", icon: LayoutTemplate, label: "Templates" },
    { to: "/ai-studio", icon: Sparkles, label: "Studio IA" },
  ];

  return (
    <aside className={clsx("w-64 bg-background border-r border-border h-full flex flex-col", className)}>
      <div className="p-8 pb-4">
        <h1 className="text-xl font-semibold text-black tracking-tight">
          PhotoFlow
        </h1>
        <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1 font-medium">Master Edition</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-4 py-2.5 rounded-sm transition-all duration-200 group text-sm",
                isActive 
                  ? "bg-black text-white font-medium" 
                  : "text-text-secondary hover:bg-slate-100 hover:text-black"
              )
            }
          >
            <item.icon size={18} strokeWidth={1.5} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <NavLink
          to="/settings"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 px-4 py-2.5 rounded-sm transition-all duration-200 text-sm",
              isActive 
                ? "bg-slate-100 text-black" 
                : "text-text-secondary hover:bg-slate-50 hover:text-black"
            )
          }
        >
          <Settings size={18} strokeWidth={1.5} />
          <span className="font-medium">Paramètres</span>
        </NavLink>
      </div>
    </aside>
  );
}