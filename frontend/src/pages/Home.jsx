import React from 'react';
import Hero from '../components/Hero';
import Store from './Store';
import Advantages from '../components/Advantages';
import Contact from '../components/Contact';

const Home = () => {
    return (
        <main>
            <section id="hero">
                <Hero />
            </section>
            <section id="store">
                <Store isPage={false} />
            </section>
            <section id="advantages">
                <Advantages />
            </section>
            <section id="contact">
                <Contact />
            </section>
        </main>
    );
};

export default Home;
