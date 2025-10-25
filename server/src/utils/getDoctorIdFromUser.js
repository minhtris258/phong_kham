import Doctor from "../models/DoctorModel.js";

/** Trả về _id của Doctor từ _id của User; null nếu chưa có hồ sơ bác sĩ */
export const getDoctorIdFromUser = async (userId) => {
  const doc = await Doctor.findOne({ user_id: userId }).select("_id").lean();
  return doc?._id || null;
};
