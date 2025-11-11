import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiUsers,
  FiUser,
  FiCalendar,
  FiLogOut,
  FiMenu,
  FiX,
  FiDollarSign,
  FiFileText,
  FiSettings,
  FiLayers,
  FiShield,
  FiActivity,
} from 'react-icons/fi';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = (() => {
    const base = [{ path: '/dashboard', icon: FiHome, label: 'Dashboard' }];

    if (user?.role === 'admin') {
      return [
        ...base,
        { path: '/patients', icon: FiUsers, label: 'Patients' },
        { path: '/doctors', icon: FiUser, label: 'Doctors' },
        { path: '/departments', icon: FiLayers, label: 'Departments' },
        { path: '/appointments', icon: FiCalendar, label: 'Appointments' },
        { path: '/rooms', icon: FiHome, label: 'Rooms' },
        { path: '/invoices', icon: FiDollarSign, label: 'Invoices' },
        { path: '/records', icon: FiFileText, label: 'Medical Records' },
        { path: '/users', icon: FiShield, label: 'User Management' },
      ];
    }

    if (user?.role === 'doctor') {
      return [
        ...base,
        { path: '/appointments', icon: FiCalendar, label: 'Appointments' },
        { path: '/records', icon: FiFileText, label: 'Medical Records' },
      ];
    }

    if (user?.role === 'receptionist') {
      return [
        ...base,
        { path: '/appointments', icon: FiCalendar, label: 'Appointments' },
        { path: '/rooms', icon: FiHome, label: 'Rooms' },
      ];
    }

    // Non-admins: show a minimal set (appointments)
    return [
      ...base,
      { path: '/appointments', icon: FiCalendar, label: 'Appointments' },
    ];
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'
        } lg:translate-x-0 lg:w-64 shadow-lg`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-8 px-3 animate-slideInLeft">
            <Link to="/" className="inline-flex items-center space-x-2 hover:opacity-80 transition-smooth">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <FiActivity className="text-white" size={18} />
              </div>
              <h1 className="text-xl font-bold text-gradient">HMS</h1>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 transition-smooth hover:rotate-90"
            >
              <FiX size={24} />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 transform-gpu animate-slideInLeft ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-medium shadow-sm scale-105'
                      : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Icon className="mr-3 transition-transform duration-200" size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-0 right-0 px-3 animate-slideInLeft" style={{ animationDelay: '0.3s' }}>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center px-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-md transition-transform hover:scale-110">
                  <FiUser className="text-white" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || user?.firstName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate capitalize">{user?.role || 'Role'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 hover-lift"
              >
                <FiLogOut className="mr-3 transition-transform duration-200 group-hover:rotate-12" size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'lg:ml-64' : ''} transition-all duration-300 ease-in-out`}>
        {/* Top Navbar */}
        <nav className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 sticky top-0 z-30 backdrop-blur-lg bg-white/95 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-500 hover:text-gray-700 transition-smooth hover:scale-110 p-1"
                aria-label="Toggle menu"
              >
                <FiMenu size={24} />
              </button>
              <Link to="/" className="inline-flex items-center space-x-2 hover:opacity-80 transition-smooth">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <FiActivity className="text-white" size={16} />
                </div>
                <span className="text-base sm:text-xl font-bold text-gradient hidden sm:inline">HMS</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 animate-fadeIn truncate">
                {menuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-3 sm:p-4 md:p-6 animate-fadeIn">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

