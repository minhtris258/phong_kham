// src/components/SpecialtySection.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toastSuccess,toastError, toastWarning, toastInfo } from "../utils/toast";
import axios from "axios";
import "../index.css";

// ====================== API ENDPOINT ======================
const API_URL = "http://localhost:3000/api/specialties";

// ====================== UTIL ======================
const resolveSpecialtyImage = (thumbnail) =>
  thumbnail || "https://via.placeholder.com/110x110.png?text=Specialty";

// =================== 1 CARD CHUYÊN KHOA ===================
function SpecialtyCard({ spec }) {
  const { _id, id, name, thumbnail, imageUrl, slug } = spec || {};

  const imgSrc = resolveSpecialtyImage(thumbnail || imageUrl);
  const linkTo = slug ? `/chuyen-khoa/${slug}` : "#.";

  return (
    <Link to={linkTo} className="col-span-1 block">
      <div className="w-[110px] h-auto justify-self-center mx-auto">
        <img
          src={imgSrc}
          alt={name || "Chuyên khoa"}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
        <h3 className="font-roboto text-xl color-title text-center mt-2">
          {name || "Chuyên khoa"}
        </h3>
      </div>
    </Link>
  );
}

// =================== SECTION DANH SÁCH CHUYÊN KHOA ===================
export default function SpecialtySection({
  title = "Chuyên khoa",
  specialties: specialtiesProp,
}) {
  const [specialties, setSpecialties] = useState(specialtiesProp || []);
  const shouldFetch = !specialtiesProp; // nếu không truyền props thì mới gọi API

  useEffect(() => {
    if (!shouldFetch) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await axios.get(API_URL, {
          headers: {
            "Content-Type": "application/json",
          },
        });


        const list =
          res.data?.specialties ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data : []);

        if (!cancelled) {
          setSpecialties(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        toastError("Fetch specialties failed:", e);
        if (!cancelled) {
          setSpecialties([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shouldFetch]);

  return (
    <section className="container py-8">
      <h2 className="lg:text-4xl text-2xl font-bold py-4 mb-8 color-title text-center">
        {title}
      </h2>

      <div className="grid lg:grid-cols-6 md:grid-cols-3 grid-cols-2 gap-8">
        {specialties.length === 0 ? (
          <p className="text-center col-span-full text-slate-600">
            Chưa có dữ liệu chuyên khoa.
          </p>
        ) : (
          specialties.map((s) => (
            <SpecialtyCard
              key={s._id || s.id || s.slug || Math.random()}
              spec={s}
            />
          ))
        )}
      </div>
    </section>
  );
}
