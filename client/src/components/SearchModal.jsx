// src/components/SearchModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { X, Search, AlertCircle, FileText } from "lucide-react"; // Thêm FileText icon
import doctorService from "../services/doctorService";
import specialtyService from "../services/SpecialtyService";
import postService from "../services/PostService";

export default function SearchModal({ isOpen, onClose, navigate, topOffset }) {
  const [searchValue, setSearchValue] = useState("");
  // Cập nhật state để chứa thêm posts
  const [quickResults, setQuickResults] = useState({ doctors: [], specialties: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  // Reset dữ liệu khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setSearchValue("");
      setQuickResults({ doctors: [], specialties: [], posts: [] });
    }
  }, [isOpen]);

  // Logic đóng khi bấm ra ngoài vùng Modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Logic tìm kiếm nhanh (Debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchValue.trim().length >= 2) {
        setLoading(true);
        try {
          // Gọi đồng thời cả 3 dịch vụ: Bác sĩ, Chuyên khoa và Bài viết
          const [dRes, sRes, pRes] = await Promise.all([
            doctorService.getAllDoctors({ search: searchValue, limit: 3 }),
            specialtyService.getAllSpecialties({ search: searchValue, limit: 5 }),
            postService.getPosts({ q: searchValue, limit: 3 }) // PostService dùng tham số 'q'
          ]);
          
          setQuickResults({
            doctors: dRes.data?.doctors || [],
            specialties: sRes.data?.specialties || [],
            posts: pRes.data?.items || [] // Trích xuất mảng bài viết từ 'items'
          });
        } catch (err) {
          console.error("Lỗi tìm kiếm nhanh:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setQuickResults({ doctors: [], specialties: [], posts: [] });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue]);

  if (!isOpen) return null;

  // Kiểm tra tổng quát xem có bất kỳ kết quả nào không
  const hasResults = quickResults.doctors.length > 0 || 
                     quickResults.specialties.length > 0 || 
                     quickResults.posts.length > 0;

  return (
    <div className="fixed inset-0 z-20 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div 
        ref={modalRef}
        className="fixed inset-x-0 bg-white shadow-2xl animate-in slide-in-from-top duration-300 rounded-b-3xl border-t border-slate-50 top-80 "
        style={{ top: `${topOffset - 30}px` }} 
      >
        <div className="container mx-auto px-4 py-6 md:py-10">
          
          <div className="max-w-5xl mx-auto relative border-b-2 border-slate-200 focus-within:border-sky-500 transition-colors">
            <input
              autoFocus
              type="text"
              placeholder="Tìm bác sĩ, chuyên khoa hoặc bài viết sức khỏe..."
              className="w-full py-4 pr-12 text-lg md:text-2xl outline-none bg-transparent placeholder:text-gray-400 font-light"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchValue.trim()) {
                  navigate(`/search?keyword=${searchValue.trim()}`);
                  onClose();
                }
              }}
            />
            {loading ? (
               <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
               <Search className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400" size={28} />
            )}
          </div>

          <div className="max-w-5xl mx-auto mt-8">
            {searchValue.trim().length >= 2 && !loading && !hasResults ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500 animate-in zoom-in-95 duration-300">
                <AlertCircle size={40} className="text-slate-300 mb-3" />
                <p className="text-sm md:text-base italic">Rất tiếc, không tìm thấy kết quả phù hợp cho "{searchValue}"</p>
              </div>
            ) : (
              searchValue.trim() !== "" && (
                <div className="grid md:grid-cols-3 gap-8 pb-6 animate-in fade-in duration-500">
                  
                  {/* CỘT 1: BÁC SĨ */}
                  {quickResults.doctors.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Đội ngũ bác sĩ</p>
                      <div className="space-y-3">
                        {quickResults.doctors.map(doc => (
                          <div 
                            key={doc._id} 
                            onClick={() => { navigate(`/doctors/${doc._id}`); onClose(); }} 
                            className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-sky-50 transition-all"
                          >
                            <img src={doc.thumbnail || "https://ui-avatars.com/api/?name=Doctor"} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                            <div>
                              <p className="font-bold text-slate-700 group-hover:text-sky-600 transition-colors text-sm line-clamp-1">Bs. {doc.fullName}</p>
                              <p className="text-[11px] text-slate-400">{doc.specialty_id?.name || "Chuyên gia"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CỘT 2: CHUYÊN KHOA */}
                  {quickResults.specialties.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Chuyên khoa</p>
                      <div className="flex flex-wrap gap-2">
                        {quickResults.specialties.map(spec => (
                          <button 
                            key={spec._id} 
                            onClick={() => { navigate(`/doctors?specialtyId=${spec._id}`); onClose(); }} 
                            className="px-3 py-1.5 bg-slate-50 hover:bg-sky-500 hover:text-white text-xs rounded-full border border-slate-100 transition-all text-slate-600 font-medium"
                          >
                            {spec.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CỘT 3: BÀI VIẾT MỚI THÊM */}
                  {quickResults.posts.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Bài viết sức khỏe</p>
                      <div className="space-y-3">
                        {quickResults.posts.map(post => (
                          <div 
                            key={post._id} 
                            onClick={() => { navigate(`/post/${post.slug}`); onClose(); }} 
                            className="flex items-start gap-3 cursor-pointer group p-2 rounded-xl hover:bg-sky-50 transition-all"
                          >
                            <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-slate-100">
                                <img src={post.thumbnail || "https://placehold.co/100x100?text=Post"} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-700 group-hover:text-sky-600 transition-colors text-sm line-clamp-2 leading-tight">
                                {post.name || post.title}
                              </p>
                              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 uppercase">
                                <FileText size={10} /> Tin tức
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}