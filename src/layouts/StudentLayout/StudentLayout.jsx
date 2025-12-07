import React from 'react';
import { Header, Footer } from '../../components/layout';

const StudentLayout = ({ children }) => {
  return (
    <div className="student-layout">
      <Header />
      <main className="student-main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default StudentLayout;
