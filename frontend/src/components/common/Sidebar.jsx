import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  QrCode,
  ScanLine,
  BookOpen,
  FileText,
  Users,
  GraduationCap,
  Building2,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          {
            path: '/student/dashboard',
            icon: LayoutDashboard,
            label: 'Dashboard',
          },
          {
            path: '/student/scan-qr',
            icon: ScanLine,
            label: 'Scan QR Code',
          },
          {
            path: '/student/attendance',
            icon: FileText,
            label: 'My Attendance',
          },
          {
            path: '/student/courses',
            icon: BookOpen,
            label: 'My Courses',
          },
        ];

      case 'teacher':
        return [
          {
            path: '/teacher/dashboard',
            icon: LayoutDashboard,
            label: 'Dashboard',
          },
          {
            path: '/teacher/generate-qr',
            icon: QrCode,
            label: 'Generate QR',
          },
          {
            path: '/teacher/attendance',
            icon: FileText,
            label: 'View Attendance',
          },
          {
            path: '/teacher/courses',
            icon: BookOpen,
            label: 'My Courses',
          },
          {
            path: '/teacher/reports',
            icon: BarChart3,
            label: 'Reports',
          },
        ];

      case 'admin':
        return [
          {
            path: '/admin/dashboard',
            icon: LayoutDashboard,
            label: 'Dashboard',
          },
          {
            path: '/admin/users',
            icon: Users,
            label: 'Manage Users',
          },
          {
            path: '/admin/courses',
            icon: GraduationCap,
            label: 'Manage Courses',
          },
          {
            path: '/admin/departments',
            icon: Building2,
            label: 'Departments',
          },
          {
            path: '/admin/analytics',
            icon: BarChart3,
            label: 'Analytics',
          },
          {
            path: '/admin/settings',
            icon: Settings,
            label: 'Settings',
          },
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="glass-panel fixed left-4 top-24 bottom-4 w-64 rounded-2xl p-6 flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Navigation</h2>
      </div>
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-lg shadow-sky-500/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;