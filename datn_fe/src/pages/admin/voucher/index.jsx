import React from 'react';
import VoucherTable from '../../../components/Admin/voucher/VoucherTable'; // Cập nhật đường dẫn nếu cần

const ManageVoucherPage = () => {
    return (
        <div className="manage-voucher-page">
            <h1>Quản lý Voucher</h1>
            <VoucherTable />
        </div>
    );
};

export default ManageVoucherPage;
