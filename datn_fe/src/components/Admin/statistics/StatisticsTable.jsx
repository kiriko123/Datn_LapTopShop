import React, { useEffect, useState } from 'react';
import { Table, Row, Col, Button, Select } from 'antd';
import { ExportOutlined, ReloadOutlined, EditTwoTone } from '@ant-design/icons';
import { callFetchOrder, callOrdersByYear, callOrdersByMonth } from "../../../services/api.js";
import * as XLSX from "xlsx";
import moment from "moment/moment.js";

const { Option } = Select;

const StatisticTable = () => {
    const [listOrder, setListOrder] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(2);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [year, setYear] = useState(null);
    const [month, setMonth] = useState(null);
    const [selectedColumns, setSelectedColumns] = useState({
        id: true,
        receiverName: true,
        totalPrice: true,
        createdAt: true,
        status: true,
        action: true,
    });

    useEffect(() => {
        fetchOrders();
    }, [current, pageSize, year, month]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            let res;

            if (year && month) {
                res = await callOrdersByMonth(year, month);
            } else if (year) {
                res = await callOrdersByYear(year);
            } else {
                res = await callFetchOrder();
            }

            console.log("Response from API:", res);
            console.log("Data inside res.data:", res.data);

            if (res && res.data) {
                let orders = [];
                if (Array.isArray(res.data)) {
                    orders = res.data;
                } else if (res.data.result) {
                    orders = res.data.result;
                }

                // Lọc các đơn hàng có trạng thái là DELIVERED
                const deliveredOrders = orders.filter(order => order.status === 'DELIVERED');
                setListOrder(deliveredOrders);
                setTotal(deliveredOrders.length);
            } else {
                setListOrder([]);
                setTotal(0);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateTotalRevenue = () => {
        return listOrder.reduce((total, order) => total + order.totalPrice, 0);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN').format(value) + ' VND';
    };

    const columns = [
        selectedColumns.id && {
            title: 'STT',
            dataIndex: 'id',
            sorter: true,
        },
        selectedColumns.createdAt && {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            render: (item) => moment(item).format('DD-MM-YYYY hh:mm:ss'),
            sorter: true,
        },
        selectedColumns.totalPrice && {
            title: 'Tổng số tiền',
            dataIndex: 'totalPrice',
            render: (item) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item),
            sorter: true,
        },
        selectedColumns.receiverName && {
            title: 'Người Nhận',
            dataIndex: 'receiverName',
            sorter: true,
        },
        selectedColumns.status && {
            title: 'Trạng thái',
            dataIndex: 'status',
            sorter: true,
        },
        selectedColumns.action && {
            title: 'Action',
            render: (text, record) => (
                <EditTwoTone twoToneColor="#f57800" style={{ cursor: "pointer" }} />
            ),
        },
    ].filter(Boolean);

    const onChange = (pagination) => {
        if (pagination.current !== current) setCurrent(pagination.current);
        if (pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize);
            setCurrent(1);
        }
    };

    const handleYearChange = (value) => {
        setYear(value);
        setMonth(null);
        setCurrent(1);
    };

    const handleMonthChange = (value) => {
        setMonth(value);
        setCurrent(1);
    };

    const handleExportData = () => {
        if (listOrder.length > 0) {
            const exportData = listOrder.map(order => ({ ...order }));
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, "ExportStatistics.csv");
        }
    };

    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
            <div style={{ display: 'flex', gap: 15 }}>
                <Select
                    placeholder="Chọn năm"
                    onChange={handleYearChange}
                    style={{ width: 120 }}
                >
                    <Option value={2024}>2024</Option>
                    <Option value={2023}>2023</Option>
                    <Option value={2022}>2022</Option>
                </Select>
                <Select
                    placeholder="Chọn tháng"
                    onChange={handleMonthChange}
                    style={{ width: 120 }}
                    disabled={!year}
                >
                    {Array.from({ length: 12 }, (_, i) => (
                        <Option key={i + 1} value={i + 1}>{i + 1}</Option>
                    ))}
                </Select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
                <Button icon={<ExportOutlined />} type="primary" onClick={handleExportData}>Export</Button>
                <Button type="ghost" onClick={() => { setYear(null); setMonth(null); }}>
                    <ReloadOutlined />
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <Table
                        title={renderHeader}
                        loading={isLoading}
                        columns={columns}
                        dataSource={listOrder}
                        onChange={onChange}
                        rowKey="id"
                        scroll={{ x: 800 }}
                        pagination={year || month ? {
                            current,
                            pageSize,
                            showSizeChanger: true,
                            total,
                            showTotal: (total, range) => <div>{range[0]}-{range[1]} trên {total} rows</div>,
                        } : false} // Disable pagination if no year or month is selected
                        footer={() => (
                            <div style={{ fontWeight: 'bold', textAlign: 'left', fontSize: '18px' }}>
                                Tổng Doanh Thu: <span style={{ color: 'red', fontSize: '20px' }}>{formatCurrency(calculateTotalRevenue())}</span>
                            </div>
                        )}
                    />
                </Col>
            </Row>
        </>
    );
};

export default StatisticTable;
