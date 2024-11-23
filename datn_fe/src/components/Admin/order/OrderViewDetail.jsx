import { Avatar, Badge, Descriptions, Drawer, Modal, Grid, Image } from "antd";
import { AntDesignOutlined } from "@ant-design/icons";
import React, { useState } from 'react';
import moment from "moment/moment.js";
const { useBreakpoint } = Grid;

const OrderViewDetail = (props) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;

    // Ant Design's responsive grid system
    const screens = useBreakpoint();

    // Đóng Drawer và xóa dữ liệu
    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    }
    // Tính tổng giá trị đơn hàng trước và sau khi áp dụng voucher
    const calculateTotalPrice = (orderDetails, voucherValue) => {
        let totalPriceBeforeDiscount = 0;

        // Tính tổng giá trị đơn hàng trước khi áp dụng voucher
        orderDetails.forEach(item => {
            const priceAfterDiscount = item.price - (item.price * item.discount / 100);
            totalPriceBeforeDiscount += priceAfterDiscount * item.quantity;
        });

        // Áp dụng voucher nếu có
        const totalPriceAfterVoucher = totalPriceBeforeDiscount - (totalPriceBeforeDiscount * (voucherValue / 100));

        return { totalPriceBeforeDiscount, totalPriceAfterVoucher };
    };

    // Kiểm tra và lấy thông tin từ dataViewDetail
    if (!dataViewDetail || !dataViewDetail.orderDetails || dataViewDetail.orderDetails.length === 0) {
        return <div>Không có dữ liệu đơn hàng</div>;  // Nếu không có dữ liệu, trả về thông báo lỗi
    }

    // Kiểm tra nếu có voucher (voucherCode sẽ là null hoặc undefined nếu không có voucher)
    const isVoucherApplied = dataViewDetail.voucherCode != null;


    // Tính tổng giá trị trước và sau khi áp dụng voucher
    const { totalPriceBeforeDiscount, totalPriceAfterVoucher } = calculateTotalPrice(dataViewDetail.orderDetails, dataViewDetail.voucherValue);

    return (
        <>
            <Drawer
                title="Chi tiết đơn hàng"
                placement="right"
                width={'70%'} // 70% width for responsive drawer
                onClose={onClose}
                visible={openViewDetail}
            >
                {dataViewDetail && (
                    <Descriptions bordered>
                        {/* Hiển thị thông tin voucher chỉ một lần ở cấp độ đơn hàng */}
                        <Descriptions.Item label="Người nhận">{dataViewDetail.receiverName}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại" span={3}>{dataViewDetail.receiverPhone}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ" span={3}>{dataViewDetail.receiverAddress}</Descriptions.Item>
                        <Descriptions.Item label="Thời gian đặt hàng" span={3}>{moment(dataViewDetail.createdAt).format("YYYY-MM-DD HH:mm:ss")}</Descriptions.Item>
                        <Descriptions.Item label="Phương thức thanh toán" span={3}>{dataViewDetail.paymentMethod}</Descriptions.Item>

                        <Descriptions.Item label="Trạng thái" span={3}>{dataViewDetail.status}</Descriptions.Item>
                        <Descriptions.Item label="Người xác nhận">{dataViewDetail.updatedBy}</Descriptions.Item>
                        <Descriptions.Item label="Thời gian cập nhật" span={3}>{moment(dataViewDetail.updatedAt).format("YYYY-MM-DD HH:mm:ss")}</Descriptions.Item>
                        {dataViewDetail.orderDetails.map((item, index) => {
                            // Calculate price after discount
                            const priceAfterDiscount = item.price - (item.price * item.discount / 100) ;

                            return (
                                <Descriptions.Item key={index} label="Chi tiết sản phẩm" span={3}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Image
                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/product/${item.thumbnail}`}
                                            alt={item.productName}
                                            width={130}
                                            preview={false}
                                        />
                                        <div>
                                            <div>
                                                <b>{index + 1}. {item.productName}</b>
                                            </div>
                                            <div>
                                                Số lượng: {item.quantity}
                                            </div>
                                            <div>
                                                Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                            </div>
                                            <div>
                                                Giảm giá: {item.discount}%
                                            </div>
                                            <div>
                                                <p>Voucher: {isVoucherApplied
                                                    ? `${dataViewDetail.voucherCode} - Giảm giá: ${dataViewDetail.voucherValue}%`
                                                    : 'Chưa sử dụng voucher'}</p>
                                                
                                            </div>
                                            <div>
                                                Giá sau giảm: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceAfterDiscount* (1 - dataViewDetail.voucherValue / 100))}
                                            </div>
                                        </div>
                                    </div>
                                </Descriptions.Item>
                            );
                        })}
                        {/* Hiển thị tổng đơn hàng sau khi áp dụng voucher (nếu có) */}
                        {isVoucherApplied ? (
                            <Descriptions.Item label="Tổng giá trị (Có voucher)" span={3}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPriceAfterVoucher)}
                            </Descriptions.Item>
                        ) : (
                            <Descriptions.Item label="Tổng giá trị (Không có voucher)" span={3}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPriceBeforeDiscount)}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Drawer>
        </>
    );
}


export default OrderViewDetail;