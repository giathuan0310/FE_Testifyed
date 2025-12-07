import Header from '../../../components/layout/Header';
import HeroSlider from '../../../components/ui/HeroSlider';
import Footer from '../../../components/layout/Footer';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Header />
      <HeroSlider />
      <Footer />
    </div>
  );
};

export default Home;
