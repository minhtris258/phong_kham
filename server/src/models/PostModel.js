import e, { text } from "express";
import mongoose from "mongoose";
import slugify from "slugify";

const BlockSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["paragraph", "image", "heading", "quote", "list", "html"],
      required: true,
    },
    text: { type: String, default: "" },
    url: { type: String, default: "" },
    level: { type: Number, min: 1, max: 6 }, // For headings
    style: { type: String, enum: ["ordered", "unordered"] },
  },
    { _id: false }
);

const PostSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true,  trim: true },
    blocks: { type: [BlockSchema], default: [] },

    thumbnail: { type: String, default: "" },
    images: [{ url: String, caption: String }],

    tags: [{ type: String, trim: true }],
    status:{ type: String, enum: ["draft", "published"], default: "draft" },

    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    views_count: { type: Number, default: 0 },
    excerpt: { type: String, default: "" },
}, { timestamps: true });

PostSchema.pre("save",function(next){
    if(!this.slug) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

PostSchema.index({
    name: "text",
    "blocks.text": "text",
    tags: "text",
    excerpt: "text",
});

const PostModel = mongoose.model("Post", PostSchema);
export default PostModel;