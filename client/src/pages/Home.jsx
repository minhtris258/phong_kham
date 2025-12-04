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

      {/* ==================== SECTION MỚI: TIN TỨC + BÁC SĨ NỔI BẬT (2 CỘT) ==================== */}
      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="container mx-auto max-w-7xl px-4">

          {/* Tiêu đề chung */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-3">
              Tin tức y tế & Bác sĩ nổi bật
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Cập nhật kiến thức sức khỏe và gặp gỡ những bác sĩ được tin tưởng nhất
            </p>
          </div>

          {/* Layout 2 cột: 7 - 3 */}
          <div className="grid lg:grid-cols-10 gap-8 xl:gap-12 items-start">
            {/* Bên trái - 7 phần */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <HomePosts />
            </div>

            {/* Bên phải - 3 phần (sidebar) */}
            <aside className="lg:col-span-3 order-1 lg:order-2">
              <div className="sticky top-24">
                <DoctorsFavorite />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <DoctorsBySpecialtySection />
      <SpecialtySection />
      <DownloadAppSection />
      <PartnersSection />
      <MediaMentionSection />
      <StatsSection />


    </>
  );
};

export default Home;