// src/pages/Home.jsx (hoặc đâu mà bạn đang để)
import React from 'react';
import Hero from '../components/Hero';
import PartnersSection from '../components/PartnersSection';
import DoctorsFavorite from '../components/DoctorsFavorite';
import SpecialtySection from '../components/SpecialtySection';
import DownloadAppSection from '../components/DownloadAppSection';
import HomePosts from '../components/post/HomePosts';
import StatsSection from '../components/StatsSection';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DoctorsBySpecialtySection from '../components/DoctorsBySpecialtySection';
import MediaMentionSection from '../components/MediaMentionSection';

const Home = () => {
  return (
    <>
      <Hero />
<DoctorsBySpecialtySection />

 <HomePosts />
         <DoctorsFavorite />
      <SpecialtySection />
      <DownloadAppSection />
      <MediaMentionSection />
      <StatsSection />
      <PartnersSection />


    </>
  );
};

export default Home;