// src/components/PostCarousel.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const API_URL = "http://localhost:3000/api/posts";

export default function PostCarousel() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(API_URL + "?status=published&limit=15");
        
        // DÙNG ĐOẠN NÀY ĐỂ XỬ LÝ MỌI TRƯỜNG HỢP TRẢ VỀ
        let posts = [];

        if (res.data) {
          // Trường hợp 1: { posts: [...] }
          if (Array.isArray(res.data.posts)) {
            posts = res.data.posts;
          }
          // Trường hợp 2: { data: [...] } hoặc mảng trực tiếp
          else if (Array.isArray(res.data.data)) {
            posts = res.data.data;
          }
          // Trường hợp 3: trả về luôn mảng [...]
          else if (Array.isArray(res.data)) {
            posts = res.data;
          }
          // Trường hợp 4: có field khác (ví dụ: items, results...)
          else if (res.data.items && Array.isArray(res.data.items)) {
            posts = res.data.items;
          }
        }

        console.log("Dữ liệu nhận được:", posts); // Xem log để biết đúng field

        // Lấy ảnh từ thumbnail hoặc images[0]
        const bannerList = posts
          .map(post => {
            const imageUrl = post.thumbnail || 
                           (post.images && post.images[0]) || 
                           (post.image && post.image) ||
                           null;
            if (!imageUrl) return null;

            return {
              id: post._id || post.id,
              slug: post.slug || post._id,
              imageUrl,
            };
          })
          .filter(Boolean);

        setBanners(bannerList);
      } catch (err) {
        console.error("Lỗi tải banner:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-3xl animate-pulse" />
    );
  }

  if (banners.length === 0) {
    console.log("Không có banner nào để hiển thị");
    return null;
  }

  return (
    <section className="w-full py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={30}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="banner-swiper"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <Link to={`/bai-viet/${banner.slug}`} className="block rounded-3xl overflow-hidden shadow-2xl">
                <div className="relative w-full h-80 md:h-96 lg:h-96">
                  <img
                    src={banner.imageUrl}
                    alt="Banner"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/1200x600/0891b2/ffffff?text=Phong+Kham+Online";
                    }}
                  />
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx>{`
        .banner-swiper {
          border-radius: 24px;
          overflow: hidden;
        }
        .banner-swiper .swiper-button-next,
        .banner-swiper .swiper-button-prev {
          color: white;
          background: rgba(0, 0, 0, 0.35);
          width: 56px;
          height: 56px;
          border-radius: 50%;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .banner-swiper .swiper-button-next:hover,
        .banner-swiper .swiper-button-prev:hover {
          background: rgba(0, 0, 0, 0.6);
        }
        .banner-swiper .swiper-pagination-bullet-active {
          background: #00d4ff;
        }
      `}</style>
    </section>
  );
}