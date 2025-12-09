import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: {type: String},
    googleId: { type: String },
    role_id: {type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true},
    profile_completed: { type: Boolean, default: false },
    status: { type: String, enum: ["pending_profile","active"], default: "pending_profile", index: true },
    authType: { type: String, enum: ['local', 'google'], default: 'local' }
},{timestamps: true}
);

const User = mongoose.model("User", userSchema);

export default User;