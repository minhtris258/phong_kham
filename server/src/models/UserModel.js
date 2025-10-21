import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    image: {type: String, required: true},
    role_id: {type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true}

},{timestamps: true}
);

const User = mongoose.model("User", userSchema);

export default User;