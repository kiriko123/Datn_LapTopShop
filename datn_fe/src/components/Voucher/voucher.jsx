import React, { useEffect, useState } from 'react';
import {
    callFetchListVoucher,
    callCreateVoucher,
    callUpdateVoucher,
    callDeleteVoucher,
} from '../../services/api.js';
import './voucher.css'; // Bạn có thể thêm CSS nếu cần

const ManageVoucherPage = () => {
    const [vouchers, setVouchers] = useState([]);
    const [formData, setFormData] = useState({
        voucherCode: '',
        voucherValue: '',
        startDate: '',
        endDate: '',
        active: true,
        description: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    // Lấy danh sách voucher
    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const response = await callFetchListVoucher();
                if (Array.isArray(response.data)) {
                    setVouchers(response.data);
                } else {
                    console.error("Dữ liệu không phải là mảng:", response.data);
                    setVouchers([]);
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu voucher:", error);
                setVouchers([]);
            }
        };
        fetchVouchers();
    }, []);

    // Xử lý thay đổi trong form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Thêm hoặc cập nhật voucher
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await callUpdateVoucher({
                    ...formData,
                    startDate: new Date(formData.startDate).toISOString(),
                    endDate: new Date(formData.endDate).toISOString(),
                }); // Cập nhật voucher
            } else {
                await callCreateVoucher({
                    ...formData,
                    startDate: new Date(formData.startDate).toISOString(),
                    endDate: new Date(formData.endDate).toISOString(),
                }); // Tạo mới voucher
            }
            resetForm();
            await refreshVouchers();
        } catch (error) {
            console.error("Lỗi khi thêm hoặc cập nhật voucher:", error);
        }
    };

    // Xóa voucher
    const handleDelete = async (id) => {
        try {
            await callDeleteVoucher(id);
            const updatedVouchers = vouchers.filter(voucher => voucher.id !== id);
            setVouchers(updatedVouchers);
        } catch (error) {
            console.error("Lỗi khi xóa voucher:", error);
        }
    };

    // Chỉnh sửa voucher
const handleEdit = (voucher) => {
    setFormData({
        id: voucher.id,  // Thêm id vào formData
        voucherCode: voucher.voucherCode,
        voucherValue: voucher.voucherValue,
        startDate: voucher.startDate.split('T')[0], // Chỉ lấy phần ngày
        endDate: voucher.endDate.split('T')[0],     // Chỉ lấy phần ngày
        active: voucher.active,
        description: voucher.description || '',
    });
    setIsEditing(true);
};

    // Đặt lại form
    const resetForm = () => {
        setFormData({
            voucherCode: '',
            voucherValue: '',
            startDate: '',
            endDate: '',
            active: true,
            description: '',
        });
        setIsEditing(false);
    };

    // Tải lại danh sách voucher
    const refreshVouchers = async () => {
        const response = await callFetchListVoucher();
        if (Array.isArray(response.data)) {
            setVouchers(response.data);
        }
    };

    return (
        <div className="manage-voucher-page">
            <h1>Quản lý Voucher</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="voucherCode"
                    value={formData.voucherCode}
                    onChange={handleChange}
                    placeholder="Mã Voucher"
                    required
                />
                <input
                    type="number"
                    name="voucherValue"
                    value={formData.voucherValue}
                    onChange={handleChange}
                    placeholder="Giảm giá (%)"
                    required
                />
                <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                />
                <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mô tả (nếu có)"
                />
                <button type="submit">{isEditing ? 'Cập nhật' : 'Tạo mới'}</button>
            </form>

            <h2>Danh sách Voucher</h2>
            <ul>
                {Array.isArray(vouchers) && vouchers.length > 0 ? (
                    vouchers.map(voucher => (
                        <li key={voucher.id}>
                            {voucher.voucherCode} - {voucher.voucherValue}% - {voucher.startDate} đến {voucher.endDate}
                            <button onClick={() => handleEdit(voucher)}>Sửa</button>
                            <button onClick={() => handleDelete(voucher.id)}>Xóa</button>
                        </li>
                    ))
                ) : (
                    <li>Không có voucher nào.</li>
                )}
            </ul>
        </div>
    );
};

export default ManageVoucherPage;
