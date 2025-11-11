import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import {
  FiUsers,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiArrowRight,
  FiShield,
  FiActivity,
} from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, appointmentsRes, patientsRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentAppointments(),
        dashboardService.getRecentPatients(),
      ]);

      setStats(statsRes?.data || statsRes);
      setRecentAppointments(appointmentsRes?.data || appointmentsRes || []);
      setRecentPatients(patientsRes?.data || patientsRes || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div
          className="relative overflow-hidden rounded-2xl p-8 text-white mb-6"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1485217988980-11786ced9454?auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-blue-600/90"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome, {user?.firstName || 'Team Member'}!</h1>
            <p className="text-blue-100">
              Access your appointments and daily tasks from one place.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow p-6 card-hover flex items-center space-x-4">
            <div className="bg-blue-100 text-blue-600 rounded-full p-3">
              <FiCalendar size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800">Your Appointments</h2>
              <p className="text-sm text-gray-600 mb-3">
                Review and manage appointments scheduled for you today.
              </p>
              <Link
                to="/appointments"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Go to Appointments <FiArrowRight className="ml-2" size={16} />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 card-hover flex items-center space-x-4">
            <div className="bg-purple-100 text-purple-600 rounded-full p-3">
              <FiShield size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800">Need admin features?</h2>
              <p className="text-sm text-gray-600 mb-3">
                Admin-only modules are restricted. Contact an administrator for access.
              </p>
              <span className="inline-flex items-center text-purple-600 font-medium">
                Limited Access
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 card-hover">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 text-green-600 rounded-full p-3">
              <FiActivity size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Stay on top of patient care</h2>
              <p className="text-sm text-gray-600">
                Use the appointments module to update patient visit status and notes in real time.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: FiUsers,
      color: 'bg-blue-500',
      link: '/patients',
    },
    {
      title: 'Total Doctors',
      value: stats?.totalDoctors || 0,
      icon: FiUser,
      color: 'bg-green-500',
      link: '/doctors',
    },
    {
      title: 'Appointments',
      value: stats?.totalAppointments || 0,
      icon: FiCalendar,
      color: 'bg-purple-500',
      link: '/appointments',
    },
    {
      title: 'Pending Invoices',
      value: stats?.pendingInvoices || 0,
      icon: FiDollarSign,
      color: 'bg-orange-500',
      link: '/invoices',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Header */}
      <div 
        className="relative overflow-hidden rounded-2xl p-8 text-white mb-6"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-blue-100">Here's what's happening at your hospital today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const gradients = {
            'bg-blue-500': 'from-blue-500 to-blue-600',
            'bg-green-500': 'from-green-500 to-emerald-600',
            'bg-purple-500': 'from-purple-500 to-pink-600',
            'bg-orange-500': 'from-orange-500 to-red-500',
          };
          const gradient = gradients[stat.color] || 'from-blue-500 to-blue-600';
          
          return (
            <Link
              key={index}
              to={stat.link}
              className="group relative bg-white rounded-xl shadow-lg p-6 hover-lift card-hover overflow-hidden animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                    {stat.value}
                  </p>
                </div>
                <div className={`bg-gradient-to-br ${gradient} p-4 rounded-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <Icon className="text-white" size={28} />
                </div>
              </div>
              
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Appointments</h2>
            <Link
              to="/appointments"
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
            >
              View all <FiArrowRight className="ml-1" size={16} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentAppointments.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent appointments</p>
            ) : (
              recentAppointments.map((appt) => (
                <div
                  key={appt._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {appt.patient?.firstName} {appt.patient?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      appt.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : appt.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Patients</h2>
            <Link
              to="/patients"
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
            >
              View all <FiArrowRight className="ml-1" size={16} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentPatients.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent patients</p>
            ) : (
              recentPatients.map((patient) => (
                <div
                  key={patient._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{patient.phone}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

