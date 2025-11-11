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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <header
        className="relative overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1580281657527-47f249e8f2d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/80 to-purple-900/80" />
        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center space-x-2 hover:opacity-80 transition-smooth">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <FiActivity className="text-white" />
            </div>
            <span className="text-white text-lg font-semibold">HMS</span>
          </Link>
          <div className="space-x-4">
            <Link to="/login" className="text-blue-100 hover:text-white transition">Login</Link>
            <Link to="/login?admin=true" className="text-blue-100 hover:text-white transition">Admin</Link>
            <Link to="/book" className="inline-flex items-center bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover-lift transition-smooth btn-glow shadow-md">
              Get Started <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </nav>
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-14 pb-16 md:pt-20 md:pb-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight animate-fadeIn">
              Manage Your Hospital with Confidence
            </h1>
            <p className="mt-5 md:mt-6 text-base md:text-lg text-blue-100 max-w-2xl animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              Streamline patient care, appointments, billing, and staff workflows — all in one modern, secure platform.
            </p>
            <div className="mt-7 md:mt-8 flex items-center space-x-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <Link to="/book" className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-smooth btn-glow shadow-lg hover-lift">
                Book Appointment
              </Link>
              <a href="#features" className="text-blue-100 hover:text-white underline-offset-4 hover:underline transition-smooth">Explore Features</a>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Secure & Compliant', desc: 'Role-based access and JWT-secured APIs.', icon: <FiShield size={24} /> },
            { title: 'Patient-Centric', desc: 'Complete profiles, records, and history.', icon: <FiUsers size={24} /> },
            { title: 'Smart Scheduling', desc: 'Powerful appointment and status flows.', icon: <FiCalendar size={24} /> },
            { title: 'Actionable Insights', desc: 'Dashboard KPIs and revenue trends.', icon: <FiTrendingUp size={24} /> },
          ].map((f, i) => (
            <div 
              key={f.title} 
              className="group bg-white rounded-xl shadow p-6 card-hover animate-fadeIn transform-gpu relative overflow-hidden cursor-pointer"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Animated background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center mb-4 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg">
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    {f.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 transition-colors duration-300 group-hover:text-blue-600">{f.title}</h3>
                <p className="mt-2 text-gray-600 transition-colors duration-300 group-hover:text-gray-700">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-16 md:pb-20">
        <div
          className="relative overflow-hidden rounded-2xl p-8 md:p-10 text-white"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1550831107-1553da8c8464?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/90" />
          <div className="relative z-10">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">Ready to simplify your hospital operations?</h2>
            <p className="mt-2 text-blue-100">Log in and start managing your hospital in minutes.</p>
            <Link to="/book" className="mt-6 inline-flex items-center bg-white text-blue-700 px-5 py-3 rounded-xl font-semibold hover-lift transition-smooth btn-glow shadow-lg group">
              Book Now <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
