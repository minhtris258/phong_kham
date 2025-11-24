// src/components/admin/doctor/DoctorScheduleAdminModal.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Modal from "../Modal";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Sun,
  Plus,
  Trash2,
  Clock,
  Calendar,
  AlertCircle,
} from "lucide-react";
import doctorSchedulesService from "../../../services/DoctorScheduleService";

const DoctorScheduleAdminModal = ({ isOpen, onClose, doctorId, doctorName }) => {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null); // ngày được click
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [exceptionFormData, setExceptionFormData] = useState({
    isDayOff: false,
    add: [],
    removeSlot: [],
  });
  const [tempTimeInput, setTempTimeInput] = useState({ start: "", end: "" });

  const calendarRef = useRef(null);

  // === FETCH DATA ===
  const fetchSchedule = async () => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const res = await doctorSchedulesService.getDoctorSchedule(doctorId);
      setScheduleData(res.data.schedule);
    } catch (err) {
      console.error("Lỗi tải lịch:", err);
      setScheduleData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && doctorId) {
      fetchSchedule();
      const today = new Date();
      setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      setSelectedDay(today.getDate());
    } else {
      setSelectedDay(null);
      setSelectedDateStr(null);
    }
  }, [isOpen, doctorId]);

  // === HELPER ===
  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const dayEnMap = { T2: "Monday", T3: "Tuesday", T4: "Wednesday", T5: "Thursday", T6: "Friday", T7: "Saturday", CN: "Sunday" };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const startDayIndex = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { startDayIndex, daysInMonth };
  };

  const { startDayIndex, daysInMonth } = getDaysInMonth(currentMonth);

  const exceptionsMap = useMemo(() => {
    if (!scheduleData?.exceptions) return {};
    return scheduleData.exceptions.reduce((map, ex) => {
      map[ex.date] = ex;
      return map;
    }, {});
  }, [scheduleData]);

  const getException = (dateStr) => exceptionsMap[dateStr];

  const handleDateClick = (day) => {
    setSelectedDay(day);
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDateStr(dateStr);

    const ex = getException(dateStr);
    setExceptionFormData({
      isDayOff: ex?.isDayOff || false,
      add: ex?.add || [],
      removeSlot: ex?.removeSlot || [],
    });
    setTempTimeInput({ start: "", end: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDateStr) return;

    const payload = {
      date: selectedDateStr,
      isDayOff: exceptionFormData.isDayOff,
      add: exceptionFormData.add,
      removeSlot: exceptionFormData.removeSlot,
    };

    try {
      await doctorSchedulesService.adminUpsertDoctorException(doctorId, payload);
      alert("Lưu ngoại lệ thành công!");
      fetchSchedule();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.error || "Không xác định"));
    }
  };

  // === RENDER ===
  if (!isOpen) return null;

  return (
    <Modal title={`Lịch làm việc - ${doctorName || ""}`} isOpen={isOpen} onClose={onClose} maxWidth="5xl">
      <div className="p-6">
        {loading ? (
          <div className="space-y-6">
            <div className="bg-gray-200 h-32 rounded-xl animate-pulse"></div>
            <div className="grid grid-cols-7 gap-3">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* CỘT 1: Lịch mặc định + Lịch tháng */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header info */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Lịch làm việc cố định</h3>
                    {scheduleData?.weekly_schedule?.length > 0 ? (
                      <p className="text-indigo-100 mt-1">
                        Slot: <strong>{scheduleData.slot_minutes} phút</strong>
                      </p>
                    ) : (
                      <p className="text-indigo-100 mt-1 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Chưa thiết lập lịch cố định
                      </p>
                    )}
                  </div>
                  <Clock className="w-12 h-12 opacity-80" />
                </div>
              </div>

              {/* Weekly Schedule Grid */}
              {scheduleData?.weekly_schedule?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
                  <div className="grid grid-cols-7">
                    {daysOfWeek.map((d) => {
                      const sch = scheduleData.weekly_schedule.find(s => s.dayOfWeek === dayEnMap[d]);
                      return (
                        <div key={d} className="border-r border-b last:border-r-0 p-4 text-center">
                          <div className="font-bold text-indigo-600 text-lg">{d}</div>
                          {sch ? (
                            <div className="mt-2 space-y-1">
                              {sch.timeRanges.map((r, i) => (
                                <div key={i} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                                  {r.start} - {r.end}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-xs mt-2">Nghỉ</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Calendar */}
              <div ref={calendarRef} className="bg-white rounded-2xl shadow-md border p-6">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                    className="p-3 hover:bg-gray-100 rounded-full transition">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h3 className="text-xl font-bold text-gray-800">
                    Tháng {currentMonth.getMonth() + 1}/{currentMonth.getFullYear()}
                  </h3>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                    className="p-3 hover:bg-gray-100 rounded-full transition">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center font-semibold text-indigo-600 mb-3">
                  {daysOfWeek.map(d => <div key={d}>{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: startDayIndex }).map((_, i) => <div key={`empty-${i}`} className="h-12" />)}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const ex = getException(dateStr);
                    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const hasDefault = scheduleData?.weekly_schedule?.some(s => s.dayOfWeek === dateObj.toLocaleString("en-US", { weekday: "long" }) && s.timeRanges?.length > 0);

                    let bg = "", dot = "";
                    if (ex?.isDayOff) { bg = "bg-red-100"; dot = "bg-red-500"; }
                    else if (ex?.add?.length > 0) { bg = "bg-yellow-100"; dot = "bg-yellow-500"; }
                    else if (ex?.removeSlot?.length > 0) { bg = "bg-orange-100"; dot = "bg-orange-500"; }
                    else if (hasDefault) { bg = "bg-green-100"; dot = "bg-green-500"; }

                    const isSelected = selectedDay === day;
                    const isToday = new Date().toISOString().slice(0, 10) === dateStr;

                    return (
                      <div
                        key={day}
                        onClick={() => handleDateClick(day)}
                        className={`relative h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 font-medium
                          ${bg} ${isSelected ? "ring-2 ring-indigo-600 shadow-xl scale-110 z-10" : ""}
                          ${isToday && !isSelected ? "ring-2 ring-indigo-400" : ""}
                          hover:shadow-md hover:scale-105`}
                      >
                        {day}
                        {(hasDefault || ex) && <span className={`absolute bottom-1 right-1 w-3 h-3 ${dot} rounded-full shadow-md`} />}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs font-medium">
                  {scheduleData?.weekly_schedule?.length > 0 && (
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span>Lịch cố định</span>
                  )}
                  <span className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-500 rounded-full"></span>Làm thêm</span>
                  <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span>Nghỉ cả ngày</span>
                  <span className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-500 rounded-full"></span>Giờ nghỉ</span>
                </div>
              </div>
            </div>

            {/* CỘT 2: Form ngoại lệ (khi chọn ngày) */}
            {selectedDateStr && (
              <div className="lg:col-span-1">
                <div className="sticky top-6 bg-white rounded-2xl shadow-xl border p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    {selectedDateStr.split("-").reverse().join("/")}
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Nghỉ cả ngày?</span>
                      <button
                        type="button"
                        onClick={() => setExceptionFormData(prev => ({ ...prev, isDayOff: !prev.isDayOff }))}
                        className={`relative inline-flex h-10 w-20 items-center rounded-full transition ${exceptionFormData.isDayOff ? "bg-red-600" : "bg-gray-300"}`}
                      >
                        <span className={`inline-block h-8 w-8 transform rounded-full bg-white transition ${exceptionFormData.isDayOff ? "translate-x-10" : "translate-x-1"}`} />
                      </button>
                    </div>

                    {exceptionFormData.isDayOff && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Toàn bộ lịch trong ngày sẽ bị hủy
                      </div>
                    )}

                    {!exceptionFormData.isDayOff && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="time" name="start" value={tempTimeInput.start} onChange={e => setTempTimeInput(prev => ({ ...prev, start: e.target.value }))} className="p-3 border rounded-lg" />
                          <input type="time" name="end" value={tempTimeInput.end} onChange={e => setTempTimeInput(prev => ({ ...prev, end: e.target.value }))} className="p-3 border rounded-lg" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button type="button" onClick={() => {
                            if (tempTimeInput.start && tempTimeInput.end && tempTimeInput.start < tempTimeInput.end) {
                              setExceptionFormData(prev => ({ ...prev, add: [...prev.add, tempTimeInput] }));
                              setTempTimeInput({ start: "", end: "" });
                            }
                          }} className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                            <Plus className="w-5 h-5" /> Làm thêm
                          </button>
                          <button type="button" onClick={() => {
                            if (tempTimeInput.start && tempTimeInput.end && tempTimeInput.start < tempTimeInput.end) {
                              setExceptionFormData(prev => ({ ...prev, removeSlot: [...prev.removeSlot, tempTimeInput] }));
                              setTempTimeInput({ start: "", end: "" });
                            }
                          }} className="bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                            <X className="w-5 h-5" /> Nghỉ giờ
                          </button>
                        </div>

                        {(exceptionFormData.add.length > 0 || exceptionFormData.removeSlot.length > 0) && (
                          <div className="space-y-3 text-sm">
                            {exceptionFormData.add.map((t, i) => (
                              <div key={i} className="bg-green-50 text-green-700 px-4 py-2 rounded-lg flex justify-between items-center">
                                <span>{t.start} - {t.end}</span>
                                <Trash2 onClick={() => setExceptionFormData(prev => ({ ...prev, add: prev.add.filter((_, idx) => idx !== i) }))} className="w-4 h-4 cursor-pointer" />
                              </div>
                            ))}
                            {exceptionFormData.removeSlot.map((t, i) => (
                              <div key={i} className="bg-red-50 text-red-700 px-4 py-2 rounded-lg flex justify-between items-center">
                                <span>{t.start} - {t.end}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex gap-3 pt-4 border-t">
                      <button type="button" onClick={() => { setSelectedDay(null); setSelectedDateStr(null); }} className="flex-1 py-3 border rounded-lg hover:bg-gray-50">
                        Hủy
                      </button>
                      <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700">
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DoctorScheduleAdminModal;