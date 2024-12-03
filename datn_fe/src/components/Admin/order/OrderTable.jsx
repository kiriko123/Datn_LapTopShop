import React, { useEffect, useState } from 'react';
import { Table, Row, Col, Popconfirm, Button, message, notification, Dropdown, Checkbox, Menu } from 'antd';
import {
    ExportOutlined,
    CloudUploadOutlined,
    PlusOutlined,
    ReloadOutlined,
    DeleteTwoTone,
    EditTwoTone
} from '@ant-design/icons';
import { callFetchOrder } from "../../../services/api.js";
import { FaEye } from "react-icons/fa";
import InputSearch from "./InputSearch.jsx";
import * as XLSX from "xlsx";
import OrderViewDetail from "./OrderViewDetail.jsx";
import OrderModalUpdate from "./OrderModalUpdate.jsx";
import moment from "moment/moment.js";
// import { render } from 'less';
// import { BsRecord } from 'react-icons/bs';

const OrderTable = () => {
    const [listOrder, setListOrder] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("");
    const [openViewDetail, setOpenViewDetail] = useState(false);
    const [dataViewDetail, setDataViewDetail] = useState(null);
    const [openModalUpdate, setOpenModalUpdate] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [current, pageSize, filter, sortQuery]);

    const fetchOrders = async () => {
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}`;
        if (filter) query += `&${filter}`;
        if (sortQuery) query += `&${sortQuery}`;
        const res = await callFetchOrder(query);
        if (res && res.data) {
            setListOrder(res.data.result);
            setTotal(res.data.meta.total);
        }
        setIsLoading(false);
    };

    const [selectedColumns, setSelectedColumns] = useState({
        id: true,
        receiverName: true,
        receiverPhone: false,
        receiverAddress: true,
        totalPrice: true,
        status: true,
        paymentMethod: true,
        user: false,
        createdAt: true,
        updatedAt: false,
        createdBy: false,
        updatedBy: false,
        description: true,
        action: true,
    });

    const [dropdownVisible, setDropdownVisible] = useState(false); // Trạng thái hiển thị menu

    const handleMenuClick = () => {
        // Không làm gì ở đây để tránh menu đóng khi chọn
    };

    const handleVisibleChange = (flag) => {
        setDropdownVisible(flag); // Điều khiển trạng thái mở/đóng của menu
    };

    const columnSelector = (
        <Menu onClick={handleMenuClick} style={{ maxHeight: '200px', overflowY: 'scroll' }}>
            {Object.keys(selectedColumns).map((key) => (
                <Menu.Item key={key}>
                    <Checkbox
                        checked={selectedColumns[key]}
                        onChange={(e) => {
                            setSelectedColumns({
                                ...selectedColumns,
                                [key]: e.target.checked,
                            });
                        }}
                    >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Checkbox>
                </Menu.Item>
            ))}
        </Menu>
    );



    const columns = [
        selectedColumns.id && {
            title: 'MĐH',
            dataIndex: 'orderNumber',
            // render: (item, record) => {
            //     return `${moment(record.createdAt).format('YYYYMM')}${record.id}`;
            // },
            sorter: true,
        },
        selectedColumns.createdAt && {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            render: (item) => {
                return moment(item).format('DD-MM-YYYY hh:mm:ss');
            },
            sorter: true,
        },
        selectedColumns.totalPrice && {
            title: 'Tổng số tiền',
            dataIndex: 'totalPrice',
            render: (item) => {
                return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item);
            },
            sorter: true,
        },
        selectedColumns.receiverName && {
            title: 'Người Nhận',
            dataIndex: 'receiverName',
            sorter: true,
        },
        selectedColumns.receiverAddress && {
            title: 'Địa chỉ',
            dataIndex: 'receiverAddress',
            sorter: true,
        },

        selectedColumns.status && {
            title: 'Trạng thái',
            dataIndex: 'status',
            sorter: true,
        },
        selectedColumns.paymentMethod && {
            title: 'Phương thức thanh toán',
            dataIndex: 'paymentMethod',
            sorter: true,
        },
        selectedColumns.description && {
            title: 'Mô tả',
            dataIndex: 'description',
            sorter: true,
        },

        selectedColumns.action && {
            title: 'Action',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <FaEye style={{ cursor: 'pointer' }} onClick={() => {
                        setDataViewDetail(record);
                        setOpenViewDetail(true);
                    }} />
                    <EditTwoTone
                        twoToneColor="#f57800" style={{cursor: "pointer"}}
                        onClick={() => {
                            setOpenModalUpdate(true);
                            setDataUpdate(record);
                        }}
                    />
                </div>
            ),
        },
    ].filter(Boolean);

    const onChange = (pagination, filters, sorter) => {
        if (pagination.current !== current) setCurrent(pagination.current);
        if (pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize);
            setCurrent(1);
        }
        if (sorter.field) {
            const q = sorter.order === 'ascend' ? `sort=${sorter.field},asc` : `sort=${sorter.field},desc`;
            setSortQuery(q);
        }
    };

    const handleExportData = () => {
        if (listOrder.length > 0) {
            const exportData = listOrder.map(order => ({
                ...order,
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, "ExportOrder.csv");
        }
    }


    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 15 }}>
            <span>Table Orders</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
                <Dropdown
                    overlay={columnSelector}
                    trigger={['click']}
                    visible={dropdownVisible} // Điều khiển trạng thái hiển thị của dropdown
                    onVisibleChange={handleVisibleChange} // Xử lý khi nhấn ra ngoài thì đóng menu
                >
                    <Button icon={<EditTwoTone/>} type="primary">Select Columns</Button>
                </Dropdown>

                <Button icon={<ExportOutlined />} type="primary" onClick={() => handleExportData()}>Export</Button>

                <Button type="ghost" onClick={() => {
                    setFilter("");
                    setSortQuery("");
                }}>
                    <ReloadOutlined />
                </Button>
            </div>
        </div>
    );

    const handleSearch = (query) => {
        setFilter(query);
        setCurrent(1);
    }


    return (
        <>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <InputSearch handleSearch={handleSearch}
                                 setFilter={setFilter}
                    />
                </Col>
                <Col span={24}>
                    <Table
                        title={renderHeader}
                        loading={isLoading}
                        columns={columns}
                        dataSource={listOrder}
                        onChange={onChange}
                        rowKey="id"
                        scroll={{ x: 800 }}
                        pagination={{
                            current,
                            pageSize,
                            showSizeChanger: true,
                            total,
                            showTotal: (total, range) => <div>{range[0]}-{range[1]} trên {total} rows</div>,
                        }}
                    />
                </Col>
                <OrderViewDetail
                    openViewDetail={openViewDetail}
                    setOpenViewDetail={setOpenViewDetail}
                    dataViewDetail={dataViewDetail}
                    setDataViewDetail={setDataViewDetail}
                    fetchOrder={fetchOrders}
                />
                <OrderModalUpdate
                    openModalUpdate={openModalUpdate}
                    setOpenModalUpdate={setOpenModalUpdate}
                    dataUpdate={dataUpdate}
                    setDataUpdate={setDataUpdate}
                    fetchOrder={fetchOrders}
                />
            </Row>
        </>
    );
};


export default OrderTable;