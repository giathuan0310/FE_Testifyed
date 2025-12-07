import React from 'react';
import './Login.css';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import LoginForm from '../../../components/ui/LoginForm';

const Login = () => {
  return (
    <div className="login-page-wrapper">
      <Header />
      
      <main className="login-main">
        <LoginForm />
      </main>

      <Footer />
    </div>
  );
};

export default Login;
