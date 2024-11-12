import { Badge, Descriptions, Divider, Space, Table, Tag, Drawer, Image } from "antd";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { callOrderHistory } from "../../services/api";
import { useSelector } from "react-redux";
import { EditTwoTone, EyeOutlined } from '@ant-design/icons';
import UserOrderUpdate from "./UserOrderUpdate.jsx";

const History = () => {
    const [orderHistory, setOrderHistory] = useState([]);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const user = useSelector(state => state.account.user);

    const [openModalUpdate, setOpenModalUpdate] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, [user.id]);

    const fetchHistory = async () => {
        const res = await callOrderHistory(user.id);
        if (res && res.data) {
            setOrderHistory(res.data);
            setFilteredHistory(res.data);  // Initialize filtered history
        }
    }

    const showDrawer = (record, index) => {
        const validIndex = typeof index === 'number' && !isNaN(index) ? index + 1 : null;
        setSelectedOrder({ ...record, index: validIndex });
        setOpenDrawer(true);
    };

    const closeDrawer = () => {
        setOpenDrawer(false);
        setSelectedOrder(null);
    };

    const handlePaymentFilter = (value) => {
        // Filter orders based on payment method
        const filtered = orderHistory.filter(order => order.paymentMethod === value);
        setFilteredHistory(filtered);
    };

    const handleStatusFilter = (value) => {
        // Filter orders based on status
        const filtered = orderHistory.filter(order => order.status === value);
        setFilteredHistory(filtered);
    };

    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            render: (item, record, index) => (<>{index + 1}</>),
        },
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            render: (item) => moment(item).format('DD-MM-YYYY hh:mm:ss'),
        },
        {
            title: 'Tổng số tiền',
            dataIndex: 'totalPrice',
            render: (item) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item),
        },
        {
            title: 'Người nhận',
            dataIndex: 'receiverName',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'receiverAddress',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            filters: [
                { text: 'Đang xử lý', value: 'PROCESSING' },
                { text: 'Đã giao', value: 'DELIVERED' },
                { text: 'Đã hủy', value: 'CANCELLED' },
                { text: 'Chờ xử lý', value: 'PENDING' },  // Thêm trạng thái Pending
            ],
            onFilter: (value, record) => record.status.includes(value),
            filterMultiple: false, // Allow only one filter at a time
        },
        {
            title: 'Phương thức thanh toán',
            dataIndex: 'paymentMethod',
            filters: [
                { text: 'Credit Card', value: 'Credit Card' },
                { text: 'Cash', value: 'Cash' },
                { text: 'Paypal', value: 'Paypal' },
            ],
            onFilter: (value, record) => record.paymentMethod.includes(value),
            filterMultiple: false, // Allow only one filter at a time
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <EyeOutlined onClick={() => showDrawer(record)} style={{ cursor: 'pointer' }} />
                    <EditTwoTone
                        twoToneColor={record.status?.trim().toUpperCase() === 'DELIVERED' ? '#d9d9d9' : '#f57800'}
                        style={{
                            cursor: record.status?.trim().toUpperCase() === 'DELIVERED' ? 'not-allowed' : 'pointer',
                            opacity: record.status?.trim().toUpperCase() === 'DELIVERED' ? 0.5 : 1
                        }}
                        onClick={() => {
                            if (record.status?.trim().toUpperCase() !== 'DELIVERED') {
                                setDataUpdate(record);
                                setOpenModalUpdate(true);
                            }
                        }}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className='mb-40 mx-10'>
            <div className="my-6 text-2xl font-bold text-gray-800">Lịch sử đặt hàng</div>
            <Table
                columns={columns}
                dataSource={filteredHistory}
                pagination={false}
                rowKey="id"
                scroll={{ x: 800 }} // Enables horizontal scrolling
            />

            <Drawer
                title="Chi tiết đơn hàng"
                placement="right"
                width={'70%'}
                onClose={closeDrawer}
                visible={openDrawer}
            >
                {selectedOrder && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Người nhận">{selectedOrder.receiverName}</Descriptions.Item>
                        <Descriptions.Item label="Thời gian đặt hàng">
                            {moment(selectedOrder.createdAt).format('DD-MM-YYYY hh:mm:ss')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng số tiền">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalPrice)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">{selectedOrder.receiverAddress}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color="green">{selectedOrder.status}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phương thức thanh toán">{selectedOrder.paymentMethod}</Descriptions.Item>
                        <Descriptions.Item label="Ghi chú">{selectedOrder.description}</Descriptions.Item>
                        <Descriptions.Item label="Chi tiết sản phẩm">
                            {selectedOrder.orderDetails.map((item, index) => {
                                const priceAfterDiscount = item.price - (item.price * item.discount / 100);
                                return (
                                    <div key={index} style={{ marginBottom: '16px' }}>
                                        <b>{index + 1}. {item.productName}</b>
                                        <div>
                                            <Image
                                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/product/${item.thumbnail}`}
                                                alt={item.productName}
                                                width={50}
                                            />
                                            <div>
                                                Số lượng: {item.quantity},
                                                Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)},
                                                Giảm giá: {item.discount}%, 
                                                Giá sau giảm: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceAfterDiscount)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>

            <UserOrderUpdate
                openModalUpdate={openModalUpdate}
                setOpenModalUpdate={setOpenModalUpdate}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                fetchCategory={fetchHistory}
            />
        </div>
    );
}

export default History;
