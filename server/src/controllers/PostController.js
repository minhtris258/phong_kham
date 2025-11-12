import Post from "../models/PostModel.js";

//POSt /api/posts
export const createPost = async (req, res) => {
  try {
    const payload = req.body;

    const newPost = new Post({
      name: payload.name,
      blocks: payload.blocks || [],
      thumbnail: payload.thumbnail,
      images: payload.images || [],
      tags: payload.tags || [],
      status: payload.status || "draft",
      published_at: payload.status === "published" ? new Date() : null,
      excerpt: payload.excerpt || "",
      author: req.user._id,
    });

    const saved = await newPost.save();
    return res.status(201).json({ message: "Tạo bài viết thành công", post: saved });
  } catch (error) {
    // Lỗi trùng slug/name unique
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Slug hoặc trường unique đã tồn tại." });
    }
    return res.status(500).json({ message: error.message });
  }
};

/** PUT /api/posts/:id  (ADMIN ONLY) */
export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;

    const post = await Post.findByIdAndUpdate(
      id,
      {
        ...payload,
        ...(payload.status === "published" ? { published_at: new Date() } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!post) return res.status(404).json({ message: "Không thấy bài viết" });
    return res.json({ message: "Cập nhật thành công", post });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

/** DELETE /api/posts/:id  (ADMIN ONLY) */
export async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Post.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Không thấy bài viết" });
    return res.json({ message: "Đã xoá" });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

/** GET /api/posts/slug/:slug  (Public, tự tăng view_count) */
export async function getPostBySlug(req, res) {
  try {
    const { slug } = req.params;
    const post = await Post.findOneAndUpdate(
      { slug, status: "published" },
      { $inc: { view_count: 1 } },
      { new: true }
    ).populate("author", "fullName email role");

    if (!post) return res.status(404).json({ message: "Không thấy bài" });
    return res.json({ post });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

/** GET /api/posts  (Public) ?q=&tag=&status=&page=&limit= */
export async function listPosts(req, res) {
  try {
    const q = (req.query.q ?? "").toString();
    const tag = req.query.tag?.toString();
    const status = (req.query.status ?? "published").toString();
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit ?? "10", 10), 1), 100);

    const filter = {};
    if (status) filter.status = status;
    if (tag) filter.tags = tag;

    let query = Post.find(filter);
    let countQuery = Post.countDocuments(filter);

    if (q) {
      query = Post.find({ ...filter, $text: { $search: q } });
      countQuery = Post.countDocuments({ ...filter, $text: { $search: q } });
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      query
        .sort(q ? { score: { $meta: "textScore" } } : { published_at: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      countQuery,
    ]);

    return res.json({
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

/** GET /api/posts/:id/related  (Public) */
export async function relatedPosts(req, res) {
  try {
    const { id } = req.params;
    const base = await Post.findById(id).lean();
    if (!base) return res.status(404).json({ message: "Không thấy bài" });

    let related = [];
    if (base.tags?.length) {
      related = await Post.find({
        _id: { $ne: base._id },
        status: "published",
        tags: { $in: base.tags },
      })
        .sort({ published_at: -1 })
        .limit(6)
        .lean();
    }

    if (!related.length) {
      related = await Post.find({
        _id: { $ne: base._id },
        status: "published",
        $text: { $search: base.name },
      })
        .select({ score: { $meta: "textScore" }, name: 1, slug: 1, thumbnail: 1, excerpt: 1, published_at: 1 })
        .sort({ score: { $meta: "textScore" } })
        .limit(6)
        .lean();
    }

    return res.json({ items: related });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}