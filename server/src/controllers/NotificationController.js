import Notification from "../models/NotificationModel.js";

// GET /api/notifications
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id; // req.user do middleware auth gắn vào
        const page = parseInt(req.query.page || "1", 10);
        const limit = parseInt(req.query.limit || "20", 10);
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            Notification.find({ user_id: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Notification.countDocuments({ user_id: userId }),
        ]);

        res.json({
            data: notifications,
            meta: {
                total,
                page,
                limit,
                lastPage: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error("getNotifications error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOne({ _id: id, user_id: userId });
        if (!notification) return res.status(404).json({ error: "Notification not found" });

        res.json(notification);
    } catch (err) {
        console.error("getNotificationById error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// POST /api/notifications
export const createNotification = async (req, res) => {
    try {
        const newNotification = new Notification(req.body);
        const saved = await newNotification.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error("createNotification error:", err);
        res.status(400).json({ error: err.message });
    }
};

// PUT /api/notifications/:id
export const updateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const updated = await Notification.findOneAndUpdate(
            { _id: id, user_id: userId },
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: "Notification not found" });

        res.json(updated);
    } catch (err) {
        console.error("updateNotification error:", err);
        res.status(400).json({ error: err.message });
    }
};

// 📍 Đánh dấu đã đọc
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notif = await Notification.findOneAndUpdate(
            { _id: id, user_id: userId },
            { status: "read" },
            { new: true }
        );

        if (!notif) return res.status(404).json({ error: "Notification not found" });

        res.json({ success: true, notification: notif });
    } catch (err) {
        console.error("markAsRead error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 📍 Đánh dấu tất cả đã đọc
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.updateMany({ user_id: userId, status: "unread" }, { status: "read" });
        res.json({ success: true });
    } catch (err) {
        console.error("markAllAsRead error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const deleted = await Notification.findOneAndDelete({ _id: id, user_id: userId });
        if (!deleted) return res.status(404).json({ error: "Notification not found" });

        res.json({ success: true });
    } catch (err) {
        console.error("deleteNotification error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};