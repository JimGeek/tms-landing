import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Advantages from './components/Advantages';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white font-sans text-metallic-900">
      <Header />
      <Hero />
      <main>
        <Services />
        <Advantages />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
