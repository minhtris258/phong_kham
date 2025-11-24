import React from 'react';
import Hero from '../components/Hero';
import PartnersSection from '../components/PartnersSection';
import DoctorsFavorite from '../components/DoctorsFavorite';
import SpecialtySection from '../components/SpecialtySection';
import RatingSection from '../components/RatingSection';


const Home = () => {
  return (
    <>
        <Hero />
        <PartnersSection />
        <DoctorsFavorite />
        <SpecialtySection />
        <RatingSection />
    </>
  );
};

export default Home;