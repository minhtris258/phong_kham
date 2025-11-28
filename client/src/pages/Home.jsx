import React from 'react';
import Hero from '../components/Hero';
import PartnersSection from '../components/PartnersSection';
import DoctorsFavorite from '../components/DoctorsFavorite';
import SpecialtySection from '../components/SpecialtySection';
import DownloadAppSection from '../components/DownloadAppSection';


const Home = () => {
  return (
    <>
      <Hero />
      <PartnersSection />
      <DoctorsFavorite />
      <SpecialtySection />
      <DownloadAppSection />

    </>
  );
};

export default Home;