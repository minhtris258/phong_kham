import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../index.css";
import Title from "./Title";

// util: format tiền VND
const formatVND = (n) =>
  typeof n === "number"
    ? n.toLocaleString("vi-VN") + "đ"
    : n
    ? Number(n).toLocaleString("vi-VN") + "đ"
    : "—";

// 1 card bác sĩ
function DoctorCard({ doc }) {
  const {
    _id,
    fullName,
    thumbnail,
    consultation_fee,
    specialty_name, // nếu API trả kèm tên chuyên khoa
    specialty, // hoặc object { name: '...' }
  } = doc || {};

  const specText = specialty_name || specialty?.name || "Bác Sĩ Chuyên Khoa";

  const imgSrc = resolveDoctorImage(thumbnail);

  return (
    <Link to={`/doctors/${_id || ""}`} className="block">
      <div className="relative items-center justify-center bg-white h-[485px] rounded-lg p-4 shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
        <Title>Được tin tưởng hợp tác và đồng hành</Title>
        <img
          className="h-40 w-auto mx-auto object-cover"
          src={imgSrc}
          alt={fullName || "doctor"}
          loading="lazy"
        />

        {/* hàng đánh giá / lượt khám (mock nếu chưa có field) */}
        <div className="py-4 bg-[#ebf9fd] flex gap-4 px-3 rounded-md mt-4">
          <div className="flex gap-1">
            <p className="text-base font-bold font-roboto">Đánh giá:</p>
            <p className="flex text-base font-roboto font-semibold text-yellow-500">
              {doc?.rating ?? 5}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="22"
                width="22"
                viewBox="0 0 576 512"
              >
                <path
                  fill="#FFD43B"
                  d="M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z"
                />
              </svg>
            </p>
          </div>

          <div className="flex gap-1 ml-auto">
            <p className="text-base font-bold font-roboto">Lượt khám:</p>
            <p className="flex text-base text-yellow-500 font-semibold font-roboto">
              {doc?.visits ?? 30}
              <svg
                stroke="currentColor"
                fill="currentColor"
                viewBox="0 0 448 512"
                height="20"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-1"
              >
                <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z" />
              </svg>
            </p>
          </div>
        </div>

        {/* Chức danh */}
        <div className="flex pt-4">
          <span className="font-roboto lg:text-2xl text-xl color-title">
            BS
          </span>
          <span className="font-roboto lg:text-2xl text-xl color-title">
            .CKI
          </span>
        </div>

        {/* Tên */}
        <h3 className="font-bold font-roboto lg:text-2xl text-xl color-title pb-4">
          {fullName || "Doctor name"}
        </h3>

        {/* Chuyên khoa */}
        <div className="flex gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="13"
            width="15"
            viewBox="0 0 576 512"
            className="self-center color-title"
          >
            <path d="M32 48C32 21.5 53.5 0 80 0l48 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-32 0 0 128c0 53 43 96 96 96s96-43 96-96l0-128-32 0c-17.7 0-32-14.3-32-32S238.3 0 256 0l48 0c26.5 0 48 21.5 48 48l0 144c0 77.4-55 142-128 156.8l0 19.2c0 61.9 50.1 112 112 112s112-50.1 112-112l0-85.5c-37.3-13.2-64-48.7-64-90.5 0-53 43-96 96-96s96 43 96 96c0 41.8-26.7 77.4-64 90.5l0 85.5c0 97.2-78.8 176-176 176S160 465.2 160 368l0-19.2C87 334 32 269.4 32 192L32 48zM480 224a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
          </svg>
          <p className="text-base font-roboto color-title">{specText}</p>
        </div>

        {/* Giá tư vấn */}
        <div className="flex gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="12"
            width="12"
            viewBox="0 0 512 512"
            className="self-center color-title"
          >
            <path d="M328 112l-144 0-37.3-74.5c-1.8-3.6-2.7-7.6-2.7-11.6 0-14.3 11.6-25.9 25.9-25.9L342.1 0c14.3 0 25.9 11.6 25.9 25.9 0 4-.9 8-2.7 11.6L328 112zM169.6 160l172.8 0 48.7 40.6C457.6 256 496 338 496 424.5 496 472.8 456.8 512 408.5 512l-305.1 0C55.2 512 16 472.8 16 424.5 16 338 54.4 256 120.9 200.6L169.6 160z" />
          </svg>
          <p className="text-base font-roboto color-title">
            {formatVND(doc?.consultation_fee)}
          </p>
        </div>

        {/* Nhãn chuyên khoa */}
        <div className="flex gap-1 pb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="12"
            width="13.5"
            viewBox="0 0 576 512"
            className="self-center color-title"
          >
            <path
              fill="#264f6d"
              d="M176 0c-35.3 0-64 28.7-64 64l0 48-48 0c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l448 0c35.3 0 64-28.7 64-64l0-272c0-35.3-28.7-64-64-64l-48 0 0-48c0-35.3-28.7-64-64-64L176 0z"
            />
          </svg>
          <p className="text-base font-roboto color-title">
            Bác Sĩ Chuyên Khoa
          </p>
        </div>

        <button className="w-full mt-2 px-4 py-2 bg-[#00b5f1] text-white rounded">
          Tư Vấn ngay
        </button>
      </div>
    </Link>
  );
}

// Section danh sách
export default function DoctorsFavorite({
  title = "Bác sĩ được yêu thích nhất",
  doctors: doctorsProp,
}) {
  const [doctors, setDoctors] = useState(doctorsProp || []);
  const shouldFetch = !doctorsProp;

  useEffect(() => {
    if (!shouldFetch) return;
    (async () => {
      try {
        // đổi URL theo API của bạn
        const res = await axios.get("/api/doctors?topLiked=true&limit=8");
        setDoctors(res.data?.data || res.data || []);
      } catch (e) {
        console.error("Fetch doctors failed:", e);
      }
    })();
  }, [shouldFetch]);

  return (
    <section
      className="bg-[#e8f4fd] py-12 lg:h-[850px]
                 lg:[--m:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]
                 lg:[mask-image:var(--m)] lg:[-webkit-mask-image:var(--m)]"
    >
      <div className="container mx-auto max-w-[1232px] px-4">
        <h2 className="lg:text-4xl text-2xl font-bold py-4 mb-8 color-title text-center">
          {title}
        </h2>

        <div className="grid lg:grid-cols-4 grid-cols-1 gap-4 items-center justify-center p-4">
          {doctors.length === 0 ? (
            <p className="text-center col-span-full text-slate-600">
              Chưa có dữ liệu bác sĩ.
            </p>
          ) : (
            doctors.map((d) => <DoctorCard key={d._id || d.email} doc={d} />)
          )}
        </div>
      </div>
    </section>
  );
}
