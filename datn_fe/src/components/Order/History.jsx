import { Badge, Descriptions, Divider, Space, Table, Tag, Drawer, Image, Steps, Typography, Button } from "antd";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { callOrderHistory } from "../../services/api";
import { useSelector } from "react-redux";
import { EditTwoTone, EyeOutlined, CheckCircleOutlined, HourglassOutlined, ScheduleOutlined, TruckOutlined } from '@ant-design/icons';
import UserOrderUpdate from "./UserOrderUpdate.jsx";

const { Title } = Typography;
const { Step } = Steps;

const History = () => {
    const [orderHistory, setOrderHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);  // Lưu trữ lịch sử đã lọc theo trạng thái
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
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
            setFilteredHistory(res.data);  // Lưu toàn bộ lịch sử đơn hàng
        }
    };

    const countStatusOrders = (status) => {
        return filteredHistory.filter(order => order.status === status).length;
    };

    const showDrawer = (record) => {
        setSelectedOrder(record);
        setSelectedStatus(record.status);
        setOpenDrawer(true);
    };

    const closeDrawer = () => {
        setOpenDrawer(false);
    };

    const getCurrentStep = (status) => {
        switch (status) {
            case "PENDING":
                return 0;
            case "PROCESSING":
                return 1;
            case "SHIPPING":
                return 2;
            case "DELIVERED":
                return 4;
            default:
                return 0;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "PENDING":
                return <HourglassOutlined style={{ color: "orange" }} />;
            case "PROCESSING":
                return <ScheduleOutlined style={{ color: "blue" }} />;
            case "SHIPPING":
                return <TruckOutlined style={{ color: "blue" }} />;
            case "DELIVERED":
                return <CheckCircleOutlined style={{ color: "green" }} />;
            default:
                return null;
        }
    };

    // Bộ lọc theo trạng thái
    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        if (status) {
            setFilteredHistory(orderHistory.filter(order => order.status === status)); // Lọc đơn hàng theo trạng thái
        } else {
            setFilteredHistory(orderHistory);  // Hiển thị tất cả nếu không có trạng thái chọn
        }
    };

    // Reset bộ lọc
    const resetFilter = () => {
        setSelectedStatus(null);
        setFilteredHistory(orderHistory);  // Hiển thị tất cả đơn hàng
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
            title: 'Status',
            dataIndex: 'status',
            filters: [
                { text: 'Đang chờ', value: 'PENDING' },
                { text: 'Đang xử lý', value: 'PROCESSING' },
                { text: 'Đang giao hàng', value: 'SHIPPING' },
                { text: 'Đã giao', value: 'DELIVERED' },
                { text: 'Đã hủy', value: 'CANCELLED' },
            ],
            onFilter: (value, record) => record.status.indexOf(value) === 0,
            render: (status) => (
                <Tag color={status === "DELIVERED" ? "green" : status === "CANCELLED" ? "red" : "orange"}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Payment method',
            dataIndex: 'paymentMethod',
        },
        {
            title: 'Description',
            dataIndex: 'description',
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <EyeOutlined onClick={() => showDrawer(record)} style={{ cursor: 'pointer' }} />
                    <EditTwoTone
                        twoToneColor={record.status === "DELIVERED" ? "rgba(255, 87, 34, 0.5)" : "#f57800"} 
                        style={{
                            cursor: record.status === "DELIVERED" ? "not-allowed" : "pointer",
                            opacity: record.status === "DELIVERED" ? 0.5 : 1,
                        }}
                        onClick={() => {
                            if (record.status !== "DELIVERED") {
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
            <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginBottom: '20px' }}>
                <Badge count={countStatusOrders("PENDING")} offset={[0, 0]} style={{ marginLeft: '-10px' }}>
                    <div style={{ textAlign: 'center' }} onClick={() => handleStatusFilter("PENDING")}>
                        <HourglassOutlined style={{ fontSize: '30px' }} />
                        <span style={{ display: 'block' }}>Đang chờ</span>
                    </div>
                </Badge>
                <Badge count={countStatusOrders("PROCESSING")} offset={[0, 0]} style={{ marginLeft: '-10px' }}>
                    <div style={{ textAlign: 'center' }} onClick={() => handleStatusFilter("PROCESSING")}>
                        <ScheduleOutlined style={{ fontSize: '30px' }} />
                        <span style={{ display: 'block' }}>Đang xử lý</span>
                    </div>
                </Badge>
                <Badge count={countStatusOrders("SHIPPING")} offset={[0, 0]} style={{ marginLeft: '-10px' }}>
                    <div style={{ textAlign: 'center' }} onClick={() => handleStatusFilter("SHIPPING")}>
                        <TruckOutlined style={{ fontSize: '30px' }} />
                        <span style={{ display: 'block' }}>Đang giao hàng</span>
                    </div>
                </Badge>
                <Badge count={countStatusOrders("DELIVERED")} offset={[0, 0]} style={{ marginLeft: '-10px' }}>
                    <div style={{ textAlign: 'center' }} onClick={() => handleStatusFilter("DELIVERED")}>
                        <CheckCircleOutlined style={{ fontSize: '30px' }} />
                        <span style={{ display: 'block' }}>Đã giao</span>
                    </div>
                </Badge>
            </div>

            {/* Nút Reset bộ lọc */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <Button onClick={resetFilter}>Reset</Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredHistory}  // Hiển thị dữ liệu đã lọc
                pagination={false}
                rowKey="id"
                scroll={{ x: 800 }}
            />

            <Drawer
                title="Chi tiết đơn hàng"
                placement="right"
                width={'70%'}
                onClose={closeDrawer}
                visible={openDrawer}
            >
                {/* Thanh trạng thái đơn hàng */}
                <div style={{ padding: '20px 0' }}>
                    <Steps current={getCurrentStep(selectedStatus)}>
                        <Step title={<HourglassOutlined style={{ fontSize: '30px', fontWeight: 'bold' }} />} description="Đang chờ" />
                        <Step title={<ScheduleOutlined style={{ fontSize: '30px', fontWeight: 'bold' }} />} description="Đang xử lý" />
                        <Step title={<TruckOutlined style={{ fontSize: '30px', fontWeight: 'bold' }} />} description="Đang giao hàng" />
                        <Step title={<CheckCircleOutlined style={{ fontSize: '30px', fontWeight: 'bold' }} />} description="Đã giao" />
                    </Steps>
                </div>
                <Divider />
                <Descriptions title="Thông tin đơn hàng" bordered>
                    <Descriptions.Item label="Mã đơn hàng">{selectedOrder?.id}</Descriptions.Item>
                    <Descriptions.Item label="Thời gian">{moment(selectedOrder?.createdAt).format("YYYY-MM-DD HH:mm:ss")}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ nhận hàng">{selectedOrder?.receiverAddress}</Descriptions.Item>
                    <Descriptions.Item label="Người nhận">{selectedOrder?.receiverName}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">{selectedOrder?.receiverPhone}</Descriptions.Item>
                    <Descriptions.Item label="Sản phẩm">
                        <ul>
                            {selectedOrder?.orderDetails?.map((item) => (
                                <li key={item.id}>
                                    {item.productName} x {item.quantity}
                                </li>
                            ))}
                        </ul>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền" span={2}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder?.totalPrice)}
                    </Descriptions.Item>
                </Descriptions>
            </Drawer>

            {openModalUpdate && (
                <UserOrderUpdate
                    openModalUpdate={openModalUpdate}
                    setOpenModalUpdate={setOpenModalUpdate}
                    dataUpdate={dataUpdate}
                />
            )}
        </div>
    );
};

export default History;
