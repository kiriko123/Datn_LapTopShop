import React, { useEffect, useState } from 'react';
import { Table, Row, Col, Popconfirm, Button, message, notification, Dropdown, Checkbox, Menu } from 'antd';
import {
    ExportOutlined,
    PlusOutlined,
    ReloadOutlined,
    DeleteTwoTone,
    EditTwoTone
} from '@ant-design/icons';
import { FaEye } from "react-icons/fa";
import InputSearch from './InputSearch';
import * as XLSX from "xlsx";
import { callDeleteVoucher, callFetchListVoucher } from "../../../services/api.js";
import VoucherViewDetail from "./VoucherViewDetail.jsx";
import VoucherModalCreate from "./VoucherModalCreate.jsx";
import VoucherModalUpdate from "./VoucherModalUpdate.jsx";

const VoucherTable = () => {
    const [listVouchers, setListVouchers] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(4);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("");
    const [openViewDetail, setOpenViewDetail] = useState(false);
    const [dataViewDetail, setDataViewDetail] = useState(null);
    const [openModalCreate, setOpenModalCreate] = useState(false);
    const [openModalUpdate, setOpenModalUpdate] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    
    // Tạo trạng thái để lưu trữ cột đã chọn
    const initialColumns = [
        {
            title: 'Mã Voucher',
            dataIndex: 'voucherCode',
            sorter: true,
        },
        {
            title: 'Giá trị (%)',
            dataIndex: 'voucherValue',
            sorter: true,
        },
        {
            title: 'Ngày hết hạn',
            dataIndex: 'endDate',
            sorter: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            sorter: true,
            render: (active) => (active ? 'Đang áp dụng' : 'Ngừng hoạt động'),
        },
        {
            title: 'Action',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <FaEye style={{ cursor: 'pointer' }} onClick={() => {
                        setDataViewDetail(record);
                        setOpenViewDetail(true);
                    }} />
                    <Popconfirm
                        placement="leftTop"
                        title="Xác nhận xóa voucher"
                        description="Bạn có chắc chắn muốn xóa voucher này?"
                        onConfirm={() => handleDeleteVoucher(record.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <span style={{ cursor: 'pointer' }}>
                            <DeleteTwoTone twoToneColor="#ff4d4f" />
                        </span>
                    </Popconfirm>
                    <EditTwoTone
                        twoToneColor="#f57800" style={{ cursor: "pointer" }}
                        onClick={() => {
                            setOpenModalUpdate(true);
                            setDataUpdate(record);
                        }}
                    />
                </div>
            ),
        },
    ];

    const [selectedColumns, setSelectedColumns] = useState(initialColumns.map(col => ({ key: col.dataIndex, visible: true })));

    const handleColumnChange = (key) => {
        setSelectedColumns((prev) =>
            prev.map((col) =>
                col.key === key ? { ...col, visible: !col.visible } : col
            )
        );
    };

    const columnSelector = (
        <Menu>
            {selectedColumns.map((col) => (
                <Menu.Item key={col.key}>
                    <Checkbox
                        checked={col.visible}
                        onChange={() => handleColumnChange(col.key)}
                    >
                        {col.key}
                    </Checkbox>
                </Menu.Item>
            ))}
        </Menu>
    );

    const visibleColumns = initialColumns.filter(col => selectedColumns.find(c => c.key === col.dataIndex && c.visible));

    useEffect(() => {
        fetchVouchers();
    }, [current, pageSize, filter, sortQuery]);

    const fetchVouchers = async () => {
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}`;
        if (filter) query += `&${filter}`;
        if (sortQuery) query += `&${sortQuery}`;

        const res = await callFetchListVoucher(query);

        if (res && res.data) {
            setListVouchers(res.data.result);
            setTotal(res.data.meta.total);
        }
        setIsLoading(false);
    };

    const handleDeleteVoucher = async (voucherId) => {
        const res = await callDeleteVoucher(voucherId);
        if (res?.data?.statusCode === 204) {
            message.success('Xóa voucher thành công');
            await fetchVouchers();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message,
            });
        }
    };

    const handleExportData = () => {
        if (listVouchers.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(listVouchers);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, "ExportVouchers.csv");
        }
    };

    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 15 }}>
            <span>Danh sách Voucher</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
                <Dropdown
                    overlay={columnSelector}
                    trigger={['click']}
                    visible={dropdownVisible}
                    onVisibleChange={setDropdownVisible}
                >
                    <Button icon={<EditTwoTone />} type="primary">Chọn Cột</Button>
                </Dropdown>
                <Button icon={<ExportOutlined />} type="primary" onClick={handleExportData}>Xuất dữ liệu</Button>
                <Button icon={<PlusOutlined />} type="primary" onClick={() => setOpenModalCreate(true)}>Thêm mới</Button>
                <Button type="ghost" onClick={() => {
                    setFilter("");
                    setSortQuery("");
                }}>
                    <ReloadOutlined />
                </Button>
            </div>
        </div>
    );

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

    const handleSearch = (query) => {
        setFilter(query);
        setCurrent(1);
    };

    return (
        <Row gutter={[20, 20]}>
            <Col span={24}>
                <InputSearch handleSearch={handleSearch} setFilter={setFilter} />
            </Col>
            <Col span={24}>
                <Table
                    title={renderHeader}
                    loading={isLoading}
                    columns={visibleColumns}
                    dataSource={listVouchers}
                    onChange={onChange}
                    rowKey="id"
                    pagination={{
                        current,
                        pageSize,
                        showSizeChanger: true,
                        total,
                        showTotal: (total, range) => <div>{range[0]}-{range[1]} trên {total} hàng</div>,
                    }}
                />
            </Col>
            <VoucherViewDetail
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
                setDataViewDetail={setDataViewDetail}
            />
            <VoucherModalCreate
                openModalCreate={openModalCreate}
                setOpenModalCreate={setOpenModalCreate}
                fetchVouchers={fetchVouchers}
            />
            <VoucherModalUpdate
                openModalUpdate={openModalUpdate}
                setOpenModalUpdate={setOpenModalUpdate}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                fetchVouchers={fetchVouchers}
            />
        </Row>
    );
};

export default VoucherTable;
