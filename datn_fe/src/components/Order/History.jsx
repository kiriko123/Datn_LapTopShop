import { Badge, Descriptions, Divider, Space, Table, Tag, Drawer, Image, Steps, Typography } from "antd";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { callOrderHistory } from "../../services/api";
import { useSelector } from "react-redux";
import { EditTwoTone, EyeOutlined, CheckCircleOutlined, HourglassOutlined, ScheduleOutlined, CloseCircleOutlined, TruckOutlined } from '@ant-design/icons';
import UserOrderUpdate from "./UserOrderUpdate.jsx";

const { Title } = Typography;
const { Step } = Steps;

const History = () => {
    const [orderHistory, setOrderHistory] = useState([]);
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
        }
    };

    const countStatusOrders = (status) => {
        return orderHistory.filter(order => order.status === status).length;
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
                        twoToneColor={record.status === "DELIVERED" ? "rgba(255, 87, 34, 0.5)" : "#f57800"} // Làm mờ nếu trạng thái là DELIVERED
                        style={{
                            cursor: record.status === "DELIVERED" ? "not-allowed" : "pointer",
                            opacity: record.status === "DELIVERED" ? 0.5 : 1, // Làm mờ
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
                    <div style={{ textAlign: 'center' }}>
                        <HourglassOutlined style={{ fontSize: '30px' }} />
                        <span style={{ display: 'block' }}>Đang chờ</span>
                    </div>
                </Badge>
                <Badge count={countStatusOrders("PROCESSING")} offset={[0, 0]} style={{ marginLeft: '-10px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <ScheduleOutlined style={{ fontSize: '30px' }} />
                        <span style={{ display: 'block' }}>Đang xử lý</span>
                    </div>
                </Badge>
                <Badge count={countStatusOrders("SHIPPING")} offset={[0, 0]} style={{ marginLeft: '-10px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <TruckOutlined style={{ fontSize: '30px' }} />
                        <span style={{ display: 'block' }}>Đang giao hàng</span>
                    </div>
                </Badge>
                <Badge count={countStatusOrders("DELIVERED")} offset={[0, 0]} style={{ marginLeft: '-10px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <CheckCircleOutlined style={{ fontSize: '30px' }} />
                        <span style={{ display: 'block' }}>Đã giao</span>
                    </div>
                </Badge>
            </div>





            <Table
                columns={columns}
                dataSource={orderHistory}
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
    <div style={{ marginTop: 20 }}>
        <Title level={4}>Trạng thái đơn hàng</Title>
        <Steps current={getCurrentStep(selectedStatus)}>
            <Step title={<HourglassOutlined style={{ fontSize: '30px', fontWeight: 'bold' }} />} />
            <Step title={<ScheduleOutlined style={{ fontSize: '30px', fontWeight: 'bold' }} />} />
            <Step title={<TruckOutlined style={{ fontSize: '30px', fontWeight: 'bold' }} />} />
            <Step title={<CheckCircleOutlined style={{ fontSize: '30px', fontWeight: 'bold' }} />} />
        </Steps>
    </div>
    {selectedOrder && (
        <>
            <Descriptions bordered column={2}>
                {/* Hiển thị thông tin đơn hàng */}
                <Descriptions.Item label="Mã đơn hàng">{selectedOrder.id}</Descriptions.Item>
                <Descriptions.Item label="Thời gian đặt hàng">{moment(selectedOrder.createdAt).format('DD-MM-YYYY hh:mm:ss')}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">{selectedOrder.status}</Descriptions.Item>
                <Descriptions.Item label="Phương thức thanh toán">{selectedOrder.paymentMethod}</Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalPrice)}</Descriptions.Item>
                <Descriptions.Item label="Người nhận">{selectedOrder.receiverName}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ nhận">{selectedOrder.receiverAddress}</Descriptions.Item>
                <Descriptions.Item label="Mô tả">{selectedOrder.description}</Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Chi tiết các sản phẩm trong đơn hàng */}
            <Title level={4}>Chi tiết sản phẩm</Title>
            {selectedOrder.orderDetails.map((item, index) => {
                const priceAfterDiscount = item.price - (item.price * item.discount / 100);
                return (
                    <Descriptions bordered key={index}>
                        <Descriptions.Item label={`Sản phẩm ${index + 1}`} span={3}>
                            <div>
                                <Image
                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/product/${item.thumbnail}`}
                                    alt={item.productName}
                                    width={50}
                                />
                                <div>
                                    Tên sản phẩm: {item.productName}<br />
                                    Số lượng: {item.quantity}<br />
                                    Giá gốc: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}<br />
                                    Giảm giá: {item.discount}%<br />
                                    Giá sau giảm: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceAfterDiscount)}
                                </div>
                            </div>
                        </Descriptions.Item>
                    </Descriptions>
                );
            })}
        </>
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