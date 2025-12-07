import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import Navbar from '../../../components/layout/Navbar';
import HeroSlider from '../../../components/ui/HeroSlider';

import './DashBoard.css';
import { Routes, Route, useLocation, Link, Outlet } from 'react-router-dom';

const NavbarWithRouter = () => {
  const location = useLocation();
  return <Navbar location={location} />;
};


const DashBoard = () => {
  return (
    <div className="dashboard-layout">
      <Header />
      <NavbarWithRouter />
      <main className="dashboard-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default DashBoard;
