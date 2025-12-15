// src/pages/admin/ContactManagement.jsx
import React, { useEffect, useState } from "react";
import contactService from "../../services/ContactService";
import { toastSuccess, toastError } from "../../utils/toast";
import {
  Eye,
  Trash2,
  Send,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";

export default function ContactManagement() {
  // --- STATE ---
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Phân trang & Lọc
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState(""); // "" = All

  // Modal chi tiết / Trả lời
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // --- EFFECT: LOAD DATA ---
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;

      const res = await contactService.getAllContacts(params);

      if (res.data?.success) {
        setContacts(res.data.data);
        setTotalPages(res.data.totalPages);
      }
    } catch (error) {
      toastError("Lỗi tải danh sách liên hệ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page, filterStatus]);

  // --- HANDLERS ---

  // 1. Xóa liên hệ
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa liên hệ này?")) return;
    try {
      await contactService.deleteContact(id);
      toastSuccess("Đã xóa liên hệ");
      fetchContacts(); // Reload lại danh sách
    } catch (error) {
      toastError("Xóa thất bại");
    }
  };

  // 2. Cập nhật trạng thái thủ công
  const handleStatusChange = async (id, newStatus) => {
    try {
      await contactService.updateStatus(id, newStatus);
      toastSuccess("Cập nhật trạng thái thành công");
      // Cập nhật UI ngay lập tức mà không cần reload
      setContacts((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
      );

      // Nếu đang mở modal của contact này thì cập nhật luôn
      if (selectedContact?._id === id) {
        setSelectedContact((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toastError("Lỗi cập nhật trạng thái");
    }
  };

  // 3. Gửi phản hồi qua Email
  const handleSendReply = async () => {
    if (!replyMessage.trim())
      return toastError("Vui lòng nhập nội dung phản hồi");

    try {
      setSendingReply(true);
      await contactService.replyContact(selectedContact._id, {
        replyMessage,
        subject: `Phản hồi thắc mắc: ${selectedContact.subject}`,
      });

      toastSuccess("Đã gửi email phản hồi!");
      setReplyMessage("");
      setSelectedContact(null); // Đóng modal
      fetchContacts(); // Reload để thấy trạng thái 'resolved'
    } catch (error) {
      toastError("Gửi email thất bại");
    } finally {
      setSendingReply(false);
    }
  };

  // --- HELPER UI ---
  const getStatusBadge = (status) => {
    switch (status) {
      case "new":
        return (
          <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 flex items-center gap-1 w-fit">
            <AlertCircle size={12} /> Mới
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2 py-1 rounded-full bg-yellow-50 text-yellow-600 text-xs font-bold border border-yellow-100 flex items-center gap-1 w-fit">
            <Clock size={12} /> Đang xử lý
          </span>
        );
      case "resolved":
        return (
          <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold border border-green-100 flex items-center gap-1 w-fit">
            <CheckCircle size={12} /> Đã xong
          </span>
        );
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">
          Quản lý Liên hệ & Phản hồi
        </h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <Filter size={18} className="text-slate-400 mr-2" />
            <select
              className="bg-transparent outline-none text-sm text-slate-700 cursor-pointer"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="new">Mới gửi (New)</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="resolved">Đã giải quyết</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">Khách hàng</th>
                <th className="p-4 font-semibold">Tiêu đề / Nội dung</th>
                <th className="p-4 font-semibold">Ngày gửi</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    Không có liên hệ nào.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-bold text-slate-800 text-sm">
                        {contact.name}
                      </p>
                      <p className="text-xs text-slate-500">{contact.email}</p>
                      <p className="text-xs text-slate-500">{contact.phone}</p>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="font-semibold text-sky-700 text-sm truncate">
                        {contact.subject}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {contact.message}
                      </p>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(contact.createdAt).toLocaleDateString("vi-VN")}
                      <br />
                      <span className="text-xs text-slate-400">
                        {new Date(contact.createdAt).toLocaleTimeString(
                          "vi-VN"
                        )}
                      </span>
                    </td>
                    <td className="p-4">{getStatusBadge(contact.status)}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="p-2 text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                          title="Xem chi tiết & Trả lời"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(contact._id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 hover:bg-slate-100 text-sm"
            >
              Trước
            </button>
            <span className="px-3 py-1 text-sm font-semibold text-slate-700">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 hover:bg-slate-100 text-sm"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL CHI TIẾT & TRẢ LỜI --- */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Chi tiết Liên hệ
                </h2>
                <div className="mt-2 flex gap-3">
                  {getStatusBadge(selectedContact.status)}
                  <span className="text-sm text-slate-500">
                    {new Date(selectedContact.createdAt).toLocaleString(
                      "vi-VN"
                    )}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Thông tin người gửi */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Họ tên
                  </label>
                  <p className="text-slate-800 font-medium">
                    {selectedContact.name}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Điện thoại
                  </label>
                  <p className="text-slate-800 font-medium">
                    {selectedContact.phone || "---"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Email
                  </label>
                  <p className="text-sky-600 font-medium">
                    {selectedContact.email}
                  </p>
                </div>
              </div>

              {/* Nội dung tin nhắn */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Tiêu đề
                </label>
                <p className="font-bold text-slate-800 mb-3">
                  {selectedContact.subject}
                </p>

                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Nội dung
                </label>
                <div className="bg-white border border-slate-200 rounded-lg p-4 text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedContact.message}
                </div>
              </div>

              {/* Khu vực xử lý trạng thái */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <span className="text-sm font-semibold text-slate-700">
                  Cập nhật trạng thái:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleStatusChange(selectedContact._id, "in_progress")
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                      selectedContact.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Đang xử lý
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(selectedContact._id, "resolved")
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                      selectedContact.status === "resolved"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Đã giải quyết
                  </button>
                </div>
              </div>

              {/* Khu vực Phản hồi */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Send size={16} /> Gửi phản hồi qua Email
                </h3>
                <textarea
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-200 focus:outline-none min-h-[100px]"
                  placeholder={`Nhập nội dung trả lời cho ${selectedContact.name}...`}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                ></textarea>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleSendReply}
                    disabled={sendingReply}
                    className="bg-sky-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-sky-700 transition-colors disabled:bg-slate-300 flex items-center gap-2"
                  >
                    {sendingReply ? "Đang gửi..." : "Gửi & Hoàn tất"}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-right italic">
                  * Khi gửi phản hồi, trạng thái sẽ tự động chuyển thành "Đã
                  xong".
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
