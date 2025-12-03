import React from 'react';
import Hero from '../components/Hero';
import PartnersSection from '../components/PartnersSection';
import DoctorsFavorite from '../components/DoctorsFavorite';
import SpecialtySection from '../components/SpecialtySection';
import DownloadAppSection from '../components/DownloadAppSection';
import PostsDirectory from '../components/post/PostsDirectory';


const Home = () => {
  return (
    <>
      <Hero />
      <DoctorsFavorite />
      <SpecialtySection />
      <DownloadAppSection />
      <PartnersSection />
      <PostsDirectory />


    </>
  );
};

export default Home;