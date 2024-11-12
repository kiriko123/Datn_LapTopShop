import React, { useEffect, useState } from 'react';
import { Card, Spin, Alert, Button, message } from 'antd';
import { callFetchListVoucher } from '../../services/api';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { TagOutlined } from '@ant-design/icons'; // Import icon từ Ant Design
import './VoucherList.css';
import axios from 'axios'; // Import axios để gọi API

const VoucherList = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Giả sử bạn lấy userId từ localStorage hoặc context
    const userId = localStorage.getItem("userId") || "defaultUserId"; // Thay đổi theo cách lấy userId thực tế trong ứng dụng của bạn

    useEffect(() => {
        const fetchVouchers = async () => {
            setLoading(true);
            try {
                const response = await callFetchListVoucher();
                if (Array.isArray(response?.data?.result)) {
                    const activeVouchers = response.data.result.filter(voucher => voucher.active);
                    setVouchers(activeVouchers);
                } else {
                    console.error('Dữ liệu không phải là mảng:', response.data);
                }
            } catch (error) {
                console.error("Lỗi khi tải voucher:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVouchers();
    }, []);

    const handleBuyNow = () => {
        navigate('/product');
    };

    // Hàm xử lý nhấp vào voucher và lưu vào backend
    const handleVoucherClick = async (voucherCode) => {
        try {
            const response = await axios.post('/api/voucher/save', {
                userId, 
                voucherCode,
            });

            if (response.data.success) {
                message.success(`Voucher ${voucherCode} đã được lưu thành công!`);
            } else {
                message.error('Lỗi khi lưu voucher.');
            }
        } catch (error) {
            message.error('Lỗi khi lưu voucher.');
        }
    };

    return (
        <div className="voucher-list">
            <div className="voucher-list__title">
                <TagOutlined className="voucher-title-icon" />
                VOUCHER ƯU ĐÃI
            </div>
            {loading ? (
                <Spin size="large" />
            ) : vouchers.length > 0 ? (
                <div className="voucher-list__cards">
                    {vouchers.map((voucher) => (
                        <Card 
                            key={voucher.id} 
                            className="voucher-card" 
                            bordered={false}
                            hoverable
                            onClick={() => handleVoucherClick(voucher.voucherCode)} // Xử lý sự kiện click
                        >
                             <div className="voucher-card__header">
                                <h3>{voucher.voucherCode}</h3>
                            </div>
                            <div className="voucher-card__item">
                                <strong>Mô tả:</strong> <span>{voucher.description}</span>
                            </div>
                            <div className="voucher-card__item">
                                <strong>Ngày bắt đầu:</strong> <span>{moment(voucher.startDate).format('DD/MM/YYYY')}</span>
                            </div>
                            <div className="voucher-card__item">
                                <strong>Ngày kết thúc:</strong> <span>{moment(voucher.endDate).format('DD/MM/YYYY')}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Alert message="Không có voucher nào đang áp dụng." type="info" showIcon />
            )}
            <div className="voucher-list__buy-container">
                <button className="voucher-button" onClick={handleBuyNow}>MUA NGAY</button>
            </div>
        </div>
    );
};

export default VoucherList;
