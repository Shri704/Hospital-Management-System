import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientForm from './pages/PatientForm';
import Doctors from './pages/Doctors';
import DoctorForm from './pages/DoctorForm';
import Appointments from './pages/Appointments';
import Invoices from './pages/Invoices';
import Records from './pages/Records';
import Home from './pages/Home';
import BookAppointment from './pages/BookAppointment';
import Departments from './pages/Departments';
import Users from './pages/Users';
import Rooms from './pages/Rooms';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ roles = [], children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/book"
        element={
          <PrivateRoute>
            <Layout>
              <BookAppointment />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <RoleRoute roles={['admin']}>
            <Layout>
              <Patients />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/patients/new"
        element={
          <RoleRoute roles={['admin']}>
            <Layout>
              <PatientForm />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/patients/:id/edit"
        element={
          <RoleRoute roles={['admin']}>
            <Layout>
              <PatientForm />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/doctors"
        element={
          <RoleRoute roles={['admin']}>
            <Layout>
              <Doctors />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/doctors/new"
        element={
          <RoleRoute roles={['admin']}>
            <Layout>
              <DoctorForm />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/doctors/:id/edit"
        element={
          <RoleRoute roles={['admin']}>
            <Layout>
              <DoctorForm />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/departments"
        element={
          <RoleRoute roles={['admin']}>
            <Layout>
              <Departments />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <PrivateRoute>
            <Layout>
              <Appointments />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <RoleRoute roles={['admin']}>
            <Layout>
              <Invoices />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/records"
        element={
          <RoleRoute roles={['admin', 'doctor']}>
            <Layout>
              <Records />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/users"
        element={
          <RoleRoute roles={['admin']}>
            <Layout>
              <Users />
            </Layout>
          </RoleRoute>
        }
      />
      <Route
        path="/rooms"
        element={
          <RoleRoute roles={['admin', 'receptionist']}>
            <Layout>
              <Rooms />
            </Layout>
          </RoleRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
