import React from 'react';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import ForgotPasswordForm from '../../../components/ui/ForgotPasswordForm';
import './ForgotPassword.css';

const ForgotPassword = () => {
  return (
    <div className="forgot-password-page-wrapper">
      <Header />
      <main className="forgot-password-main">
        <ForgotPasswordForm />
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
