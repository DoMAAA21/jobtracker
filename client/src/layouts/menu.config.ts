import {
  Briefcase,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export type MenuItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export const mainMenuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Applications',
    path: '/applications',
    icon: Briefcase,
  },
];

export const footerMenuItems: MenuItem[] = [
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];
