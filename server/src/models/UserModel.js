import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    role_id: {type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true},
    thumbnail: { type: String, default: "" },
    profile_completed: { type: Boolean, default: false },
    status: { type: String, enum: ["pending_profile","active"], default: "pending_profile", index: true }
},{timestamps: true}
);

const User = mongoose.model("User", userSchema);

export default User;