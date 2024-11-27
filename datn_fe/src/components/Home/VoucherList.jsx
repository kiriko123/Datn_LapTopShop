import React, { useEffect, useState } from 'react';
import { Card, Spin, Alert, Button, message } from 'antd';
import { callFetchListVoucher } from '../../services/api';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { TagOutlined } from '@ant-design/icons'; // Import icon từ Ant Design
import './VoucherList.css';
import axios from 'axios';
import { useSelector } from "react-redux"; // Import axios để gọi API
import { LeftOutlined, RightOutlined } from '@ant-design/icons'; // Import icon từ Ant Design


const VoucherList = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const user = useSelector(state => state.account.user);
    const [startIndex, setStartIndex] = useState(0); // Vị trí bắt đầu hiển thị

    const handleNext = () => {
        if (startIndex + 4 < vouchers.length) {
            setStartIndex(startIndex + 4);
        }
    };

    const handleBack = () => {
        if (startIndex - 4 >= 0) {
            setStartIndex(startIndex - 4);
        }
    };

    useEffect(() => {
        const fetchVouchers = async () => {
            setLoading(true);
            try {
                const response = await callFetchListVoucher();
                if (Array.isArray(response?.data?.result)) {
                    //Lọc các voucher active và còn trong hạn sử dụng
                    const activeVouchers = response.data.result.filter(voucher => {
                        const now = new Date();
                        const startDate = new Date(voucher.startDate);
                        const endDate = new Date(voucher.endDate);
                        return voucher.active && now >= startDate && now <= endDate;
                    });
    
                    setVouchers(activeVouchers);
                    
                } else {
                    console.error('Dữ liệu không phải là mảng:', response.data);
                    message.error("Không thể tải danh sách voucher.");
                }
            } catch (error) {
                console.error("Lỗi khi tải voucher:", error);
                message.error("Không thể tải danh sách voucher.");
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
    const handleVoucherClick = async (voucherId) => {
        const userId = user.id;
        const userRole = user.role.name;


        if (user.id === '') {
            message.error('Bạn chưa đăng nhập, vui lòng đăng nhập để lưu voucher.');
            return;
        }

        // Kiểm tra nếu người dùng có vai trò ADMIN
        if (userRole === 'ROLE_ADMIN') {
            message.error('Admin không thể lưu voucher.');
            return;
        }

        try {
            // Gọi API claim voucher
            const response = await axios.post(`http://localhost:8080/api/v1/user-voucher/${userId}/claim/${voucherId}`);

            // Hiển thị thông báo từ response
            const responseData = response.data;

            if (responseData.message) {
                message.info(responseData.message);

            }
        } catch (error) {
            console.error("Lỗi khi lưu voucher:", error);

            // Hiển thị lỗi chi tiết từ backend (nếu có)
            if (error.response) {
                const errorMessage = error.response.data.message || 'Lỗi khi lưu voucher. Vui lòng thử lại.';
                message.error(errorMessage);
            } else {
                message.error('Lỗi khi lưu voucher. Vui lòng thử lại.');
            }
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
                <div>

                    <div className="voucher-list__cards">
                        <LeftOutlined
                            onClick={handleBack}
                            className={`navigation-icon ${startIndex === 0 ? 'disabled' : ''}`}
                        />
                        {vouchers.slice(startIndex, startIndex + 4).map((voucher) => (
                            <Card
                                key={voucher.id}
                                className="voucher-card"
                                bordered={false}
                                hoverable
                            >
                                <div className="voucher-card__header">
                                    <h3>{voucher.voucherCode}</h3>
                                </div>
                                <div className="voucher-card__item">
                                    <strong>Mô tả: </strong> <span>{voucher.description}</span>
                                </div>
                                <div className="voucher-card__item">
                                    <strong>Ngày bắt đầu: </strong>
                                    <span>{moment(voucher.startDate).format('DD/MM/YYYY')}</span>
                                </div>
                                <div className="voucher-card__item">
                                    <strong>Ngày kết thúc: </strong>
                                    <span>{moment(voucher.endDate).format('DD/MM/YYYY')}</span>
                                </div>
                                <div className="voucher-card__actions">
                                    <button
                                        className="add-voucher-btn"
                                        onClick={() => handleVoucherClick(voucher.id)}
                                    >
                                        Thu thập
                                    </button>
                                </div>
                            </Card>
                        ))}
                        <RightOutlined
                            onClick={handleNext}
                            className={`navigation-icon ${startIndex + 4 >= vouchers.length ? 'disabled' : ''}`}
                        />
                    </div>
                    
                </div>
            ) : (
                <Alert message="Không có voucher nào đang áp dụng." type="info" showIcon />
            )}
            <div className="voucher-list__buy-container">
                <Button className="voucher-button" onClick={handleBuyNow}>
                    MUA NGAY
                </Button>
            </div>
        </div>
    );
};
export default VoucherList;
