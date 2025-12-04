import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        type: { type: String, enum: ["appointment", "reminder", "general", "rating_request", "visit"], required: true },
        title: { type: String, required: true },
        body: { type: String, required: true },
        data: { type: mongoose.Schema.Types.Mixed },
        appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
        qr: { type: String },
        channels: { type: [String], enum: ["in-app", "email", "sms"], default: ["in-app"] },
        status: { type: String, enum: ["unread", "read"], default: "unread", index: true },
        sent_at: { type: Date },
        expires_at: { type: Date },
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;