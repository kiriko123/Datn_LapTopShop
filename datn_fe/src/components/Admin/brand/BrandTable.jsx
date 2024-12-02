import React, { useEffect, useState } from 'react';
import { Table, Row, Col, Popconfirm, Button, message, notification, Dropdown, Checkbox, Menu, Image } from 'antd';
import {
    ExportOutlined,
    CloudUploadOutlined,
    PlusOutlined,
    ReloadOutlined,
    DeleteTwoTone,
    EditTwoTone
} from '@ant-design/icons';
import { callFetchListBrand, callUpdateBrand, callDeleteBrand } from "../../../services/api.js";
import { FaEye } from "react-icons/fa";
import InputSearch from './InputSearch.jsx';
import BrandViewDetail from "./BrandViewDetail.jsx";
import BrandModalCreate from "./BrandModalCreate.jsx";
import * as XLSX from "xlsx";
import BrandModalUpdate from "./BrandModalUpdate.jsx";
import { CgColorPicker } from "react-icons/cg";
import moment from "moment/moment.js";

const BrandTable = () => {
    const [listBrand, setListBrand] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("");
    const [openViewDetail, setOpenViewDetail] = useState(false);
    const [dataViewDetail, setDataViewDetail] = useState(null);
    const [openModalCreate, setOpenModalCreate] = useState(false);

    const [openModalImport, setOpenModalImport] = useState(false);

    const [openModalUpdate, setOpenModalUpdate] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(null);

    useEffect(() => {
        fetchBrands();
    }, [current, pageSize, filter, sortQuery]);

    const fetchBrands = async () => {
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}`;
        if (filter) query += `&${filter}`;
        if (sortQuery) query += `&${sortQuery}`;
        const res = await callFetchListBrand(query);
        if (res && res.data) {
            setListBrand(res.data.result);
            setTotal(res.data.meta.total);
        }
        setIsLoading(false);
    };

    const [selectedColumns, setSelectedColumns] = useState({
        id: true,
        name: true,
        description: true,
        thumbnail: false,
        active: true,
        createdAt: false,
        updatedAt: false,
        createdBy: false,
        updatedBy: false,
        action: true,
    });

    const [dropdownVisible, setDropdownVisible] = useState(false);

    const handleMenuClick = () => {
        // Không làm gì ở đây để tránh menu đóng khi chọn
    };

    const handleVisibleChange = (flag) => {
        setDropdownVisible(flag);
    };

    const columnSelector = (
        <Menu
            onClick={handleMenuClick}
            style={{
                maxHeight: '300px',
                overflowY: 'auto',
                width: '200px'
            }}
        >
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
            title: 'Id',
            dataIndex: 'id',
            sorter: true,
        },
        selectedColumns.name && {
            title: 'Tên thương hiệu',
            dataIndex: 'name',
            sorter: true,
        },
        selectedColumns.description && {
            title: 'Mô tả',
            dataIndex: 'description',
            sorter: true,
        },

        selectedColumns.thumbnail && {
            title: 'Hình ảnh',
            dataIndex: 'thumbnail',
            sorter: true,
            render: (text, record) => {
                return (
                    <Image
                        width={100}
                        src={`${import.meta.env.VITE_BACKEND_URL}/storage/brand/${record.thumbnail}`}
                        preview={{
                            src: `${import.meta.env.VITE_BACKEND_URL}/storage/brand/${record.thumbnail}`,
                        }}
                    />
                );
            }
        },
        selectedColumns.active && {
            title: 'Kích hoạt',
            dataIndex: 'active',
            sorter: true,
            render: (enabled) => (enabled ? 'Actived' : 'Disabled'), // Chuyển đổi giá trị true/false
        },
        selectedColumns.createdAt && {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            render: (item) => {
                return moment(item).format('DD-MM-YYYY hh:mm:ss');
            },
            sorter: true,
        },
        selectedColumns.updatedAt && {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            render: (item) => {
                return moment(item).format('DD-MM-YYYY hh:mm:ss');
            },
            sorter: true,
        },
        selectedColumns.createdBy && {
            title: 'Tạo bởi',
            dataIndex: 'createdBy',
            sorter: true,
        },
        selectedColumns.updatedBy && {
            title: 'Cập nhật bởi',
            dataIndex: 'updatedBy',
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
                    <Popconfirm
                        placement="leftTop"
                        title="Xác nhận xóa thương hiệu"
                        description="Bạn có chắc chắn muốn xóa thương hiệu này?"
                        onConfirm={() => handleDeleteBrand(record.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <span style={{ cursor: 'pointer' }}>
                            <DeleteTwoTone twoToneColor="#ff4d4f" />
                        </span>
                    </Popconfirm>
                    <EditTwoTone
                        twoToneColor="#f57800"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            setDataUpdate(record);
                            setOpenModalUpdate(true);
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

    const handleDeactivateBrand = async (record) => {
        try {
            const updatedBrand = { ...record, active: false };
            const res = await callUpdateBrand(record.id, updatedBrand);
            if (res?.data) {
                message.success('Vô hiệu hóa thương hiệu thành công');
                fetchBrands();
            } else {
                throw new Error(res.message);
            }
        } catch (error) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error.message,
            });
        }
    };

    const handleDeleteBrand = async (brandId) => {
        const res = await callDeleteBrand(brandId);
        if (res?.data?.statusCode === 204) {
            message.success('Xóa thương hiệu thành công');
            fetchBrands();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message,
            });
        }
    };

    const handleExportData = () => {
        if (listBrand.length > 0) {
            const exportData = listBrand.map(brand => ({
                ...brand,
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, "ExportBrand.csv");
        }
    }

    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 15 }}>
            <span>Table Brands</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
                <Dropdown
                    overlay={columnSelector}
                    trigger={['click']}
                    visible={dropdownVisible}
                    onVisibleChange={handleVisibleChange}
                >
                    <Button icon={<EditTwoTone />} type="primary">Select Columns</Button>
                </Dropdown>
                <Button icon={<ExportOutlined />} type="primary" onClick={() => handleExportData()}>Export</Button>
                {/*<Button icon={<CloudUploadOutlined />} type="primary" onClick={() => setOpenModalImport(true)}>Import</Button>*/}
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

    return (
        <>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <InputSearch handleSearch={setFilter} />
                </Col>
                <Col span={24}>
                    <Table
                        title={renderHeader}
                        loading={isLoading}
                        columns={columns}
                        dataSource={listBrand}
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
                <BrandViewDetail
                    openViewDetail={openViewDetail}
                    setOpenViewDetail={setOpenViewDetail}
                    dataViewDetail={dataViewDetail}
                    setDataViewDetail={setDataViewDetail}
                />
                <BrandModalCreate
                    openModalCreate={openModalCreate}
                    setOpenModalCreate={setOpenModalCreate}
                    fetchBrands={fetchBrands}
                />

                <BrandModalUpdate
                    open={openModalUpdate}
                    setOpen={setOpenModalUpdate}
                    dataUpdate={dataUpdate}
                    setDataUpdate={setDataUpdate}
                    fetchBrands={fetchBrands}
                />
            </Row>
        </>
    );
};

export default BrandTable;
