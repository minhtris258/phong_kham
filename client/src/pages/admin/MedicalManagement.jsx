// src/pages/admin/MedicineManagement.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import medicineService from '../../services/medicineService'; 
import { toastSuccess, toastError, toastWarning } from "../../utils/toast";

import MedicineList from '../../components/admin/medicine/MedicineList';
import MedicineFormModal from '../../components/admin/medicine/MedicineFormModal';
import SpecialtyDeleteModal from '../../components/admin/specialty/SpecialtyDeleteModal'; 

const MedicineManagement = () => {
    // === STATE QUẢN LÝ DỮ LIỆU & PHÂN TRANG ===
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDocs, setTotalDocs] = useState(0);

    // State Modal & Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [formData, setFormData] = useState({});
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // === FETCH MEDICINES ===
    const fetchMedicines = async (currentPage = page, search = searchTerm) => {
        setLoading(true);
        try {
            // Gọi API với tham số page và limit
            const response = await medicineService.getMedicines({ 
                search, 
                page: currentPage, 
                limit: 10 // Số lượng item mỗi trang
            }); 
            
            // Cập nhật dữ liệu
            const list = response.data?.data || [];
            setMedicines(list);

            // Cập nhật thông tin phân trang từ response API
            if (response.data?.pagination) {
                setTotalPages(response.data.pagination.totalPages);
                setTotalDocs(response.data.pagination.total);
                setPage(response.data.pagination.page);
            }
        } catch (err) {
            console.error(err);
            toastError("Không thể tải danh sách thuốc.");
        } finally {
            setLoading(false);
        }
    };

    // Load data lần đầu
    useEffect(() => {
        fetchMedicines();
    }, []);

    // === HANDLERS ===
    
    // Xử lý tìm kiếm (Reset về trang 1)
    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setPage(1);
            fetchMedicines(1, searchTerm);
        }
    };

    // Xử lý chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            fetchMedicines(newPage, searchTerm);
        }
    };

    const handleAddEdit = (med) => {
        setEditingMedicine(med);
        setFormData(med 
            ? { ...med, dosages: med.dosages || [] } 
            : { name: '', unit: '', description: '', status: 'active', dosages: [] }
        );
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name) return toastWarning("Tên thuốc là bắt buộc!");

        try {
            if (editingMedicine) {
                await medicineService.updateMedicine(editingMedicine._id, formData);
                toastSuccess("Cập nhật thành công!");
            } else {
                await medicineService.createMedicine(formData);
                toastSuccess("Thêm thuốc mới thành công!");
            }
            setIsModalOpen(false);
            fetchMedicines(page, searchTerm); // Reload lại trang hiện tại
        } catch (err) {
            toastError(err.response?.data?.error || "Lỗi khi lưu thuốc.");
        }
    };

    const handleDelete = async () => {
        try {
            await medicineService.deleteMedicine(confirmDeleteId);
            toastSuccess("Đã xóa thuốc thành công!");
            setConfirmDeleteId(null);
            
            // Nếu xóa item cuối cùng của trang, lùi lại 1 trang
            if (medicines.length === 1 && page > 1) {
                fetchMedicines(page - 1, searchTerm);
            } else {
                fetchMedicines(page, searchTerm);
            }
        } catch (err) {
            toastError("Xóa thất bại.");
        }
    };

    return (
        <main className="flex-1 p-4 sm:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-gray-900">Quản Lý Kho Thuốc</h2>
                
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm thuốc..." 
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>

                    <button 
                        onClick={() => handleAddEdit(null)}
                        className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5 mr-1" /> Thêm Thuốc
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Đang tải dữ liệu...</div>
            ) : (
                <MedicineList 
                    medicines={medicines}
                    handleAddEdit={handleAddEdit}
                    confirmDelete={setConfirmDeleteId}
                    // Truyền Props phân trang xuống List
                    pagination={{ page, totalPages, totalDocs }}
                    onPageChange={handlePageChange}
                />
            )}

            <MedicineFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formData={formData}
                setFormData={setFormData} 
                handleSave={handleSave}
                editingMedicine={editingMedicine}
            />

            <SpecialtyDeleteModal 
                confirmDeleteId={confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                handleDelete={handleDelete}
            />
        </main>
    );
};

export default MedicineManagement;