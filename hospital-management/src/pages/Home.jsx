// Improved responsive version of Home component
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { FiActivity, FiShield, FiTrendingUp, FiUsers, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const features = [
    { title: 'Secure & Compliant', desc: 'Role-based access and JWT-secured APIs.', icon: <FiShield size={20} /> },
    { title: 'Patient-Centric', desc: 'Complete profiles, records, and history.', icon: <FiUsers size={20} /> },
    { title: 'Smart Scheduling', desc: 'Powerful appointment and status flows.', icon: <FiCalendar size={20} /> },
    { title: 'Actionable Insights', desc: 'Dashboard KPIs and revenue trends.', icon: <FiTrendingUp size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1580281657527-47f249e8f2d2?...')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/80 to-purple-900/80" />

        {/* Navbar */}
        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center space-x-2 hover:opacity-80 transition">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <FiActivity className="text-white" />
            </div>
            <span className="text-white text-lg font-semibold">HMS</span>
          </Link>

          <div className="hidden sm:flex items-center space-x-4">
            <Link to="/login" className="text-blue-100 hover:text-white transition">Login</Link>
            <Link to="/login?admin=true" className="text-blue-100 hover:text-white transition">Admin</Link>
            <Link to="/book" className="inline-flex items-center bg-white text-blue-700 px-4 py-2 rounded-lg font-medium shadow-md hover:opacity-90">
              Get Started <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center sm:text-left">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Manage Your Hospital with Confidence
          </h1>
          <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-xl">
            Streamline patient care, appointments, billing, and staff workflows — all in one modern, secure platform.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center sm:justify-start">
            <Link to="/book" className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg">
              Book Appointment
            </Link>
            <a href="#features" className="text-blue-100 hover:text-white underline underline-offset-4">Explore Features</a>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-xl shadow p-6 hover:shadow-xl transition">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{f.title}</h3>
              <p className="mt-2 text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-10 text-white">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1550831107-1553da8c8464?...')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/90" />

          <div className="relative z-10 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Ready to simplify your hospital operations?</h2>
            <p className="mt-2 text-blue-100">Log in and start managing your hospital in minutes.</p>
            <Link to="/book" className="mt-6 inline-flex items-center bg-white text-blue-700 px-5 py-3 rounded-xl font-semibold shadow-lg">
              Book Now <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;