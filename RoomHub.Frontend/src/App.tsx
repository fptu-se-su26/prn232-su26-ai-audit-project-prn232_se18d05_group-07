import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Browse from './pages/Browse';
import RoomDetail from './pages/RoomDetail';
import ForLandlords from './pages/ForLandlords';
import HowItWorks from './pages/HowItWorks';
import Support from './pages/Support';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetOtp from './pages/VerifyResetOtp';
import ResetPassword from './pages/ResetPassword';
import VerifySuccess from './pages/VerifySuccess';
import { AuthProvider } from './context/AuthContext';

const AppContent: React.FC = () => {
  return (
    <div className="bg-background text-on-surface antialiased overflow-x-hidden min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/room/:id" element={<RoomDetail />} />
          <Route path="/landlords" element={<ForLandlords />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/support" element={<Support />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-success" element={<VerifySuccess />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
