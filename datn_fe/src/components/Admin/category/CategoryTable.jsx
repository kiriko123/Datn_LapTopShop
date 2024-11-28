// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import {Table, Row, Col, Popconfirm, Button, message, notification, Dropdown, Checkbox, Menu, Image} from 'antd';
import {
    ExportOutlined,
    PlusOutlined,
    ReloadOutlined,
    DeleteTwoTone,
    EditTwoTone
} from '@ant-design/icons';
import { callDeleteCategory, callFetchListCategory } from "../../../services/api.js";
import { FaEye } from "react-icons/fa";
import InputSearch from './InputSearch';
import CategoryViewDetail from "./CategoryViewDetail.jsx";
import CategoryCreate from "./CategoryCreate.jsx";
import * as XLSX from "xlsx";
import CategoryUpdate from "./CategoryUpdate.jsx";
import moment from "moment/moment.js";

const CategoryTable = () => {
    const [listCategory, setListCategory] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("");
    const [openViewDetail, setOpenViewDetail] = useState(false);
    const [dataViewDetail, setDataViewDetail] = useState(null);
    const [openModalCreate, setOpenModalCreate] = useState(false);

    // const [openModalImport, setOpenModalImport] = useState(false);

    const [openModalUpdate, setOpenModalUpdate] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, [current, pageSize, filter, sortQuery]);

    const fetchCategories = async () => {
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}`;
        if (filter) query += `&${filter}`;
        if (sortQuery) query += `&${sortQuery}`;
        const res = await callFetchListCategory(query);
        if (res && res.data) {
            setListCategory(res.data.result);
            setTotal(res.data.meta.total);
        }
        setIsLoading(false);
    };

    const [selectedColumns, setSelectedColumns] = useState({
        id: true,
        name: true,
        thumbnail: false,
        description: true,
        hot: true,
        active: true,
        createdAt: false,
        updatedAt: false,
        createdBy: false,
        updatedBy: false,
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
            title: 'Id',
            dataIndex: 'id',
            sorter: true,
        },
        selectedColumns.name && {
            title: 'Name',
            dataIndex: 'name',
            sorter: true,
        },
        // selectedColumns.thumbnail && {
        //     title: 'Thumbnail',
        //     dataIndex: 'thumbnail',
        //     sorter: true,
        // },
        selectedColumns.thumbnail && {
            title: 'Thumbnail',
            dataIndex: 'thumbnail',
            sorter: true,
            render: (text, record) => {
                return (
                    <Image
                        width={100}
                        src={`${import.meta.env.VITE_BACKEND_URL}/storage/category-thumbnail/${record.thumbnail}`}
                        preview={{
                            src: `${import.meta.env.VITE_BACKEND_URL}/storage/category-thumbnail/${record.thumbnail}`,
                        }}
                    />
                );
            }
        },
        selectedColumns.description && {
            title: 'Description',
            dataIndex: 'description',
            sorter: true,
        },
        selectedColumns.hot && {
            title: 'Hot',
            dataIndex: 'hot',
            sorter: true,
            render: (enabled) => (enabled ? 'Yes' : 'No'), // Chuyển đổi giá trị true/false
        },
        selectedColumns.active && {
            title: 'Active',
            dataIndex: 'active',
            sorter: true,
            render: (enabled) => (enabled ? 'Actived' : 'Disabled'), // Chuyển đổi giá trị true/false
        },
        selectedColumns.createdAt && {
            title: 'CreatedAt',
            dataIndex: 'createdAt',
            render: (item) => {
                return moment(item).format('DD-MM-YYYY hh:mm:ss');
            },
            sorter: true,
        },
        selectedColumns.updatedAt && {
            title: 'UpdatedAt',
            dataIndex: 'updatedAt',
            render: (item) => {
                return moment(item).format('DD-MM-YYYY hh:mm:ss');
            },
            sorter: true,
        },
        selectedColumns.createdBy && {
            title: 'CreatedBy',
            dataIndex: 'createdBy',
            sorter: true,
        },
        selectedColumns.updatedBy && {
            title: 'UpdatedBy',
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
                        title="Xác nhận xóa category"
                        description="Bạn có chắc chắn muốn xóa category này?"
                        onConfirm={() => handleDeleteCategory(record.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <span style={{ cursor: 'pointer' }}>
                            <DeleteTwoTone twoToneColor="#ff4d4f" />
                        </span>
                    </Popconfirm>
                    <EditTwoTone
                        twoToneColor="#f57800" style={{cursor: "pointer"}}
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

    const handleDeleteCategory = async (categoryId) => {
        const res = await callDeleteCategory(categoryId);
        if (res?.data?.statusCode === 204) {
            message.success('Xóa category thành công');
            fetchCategories();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message,
            });
        }
    };

    const handleExportData = () => {
        if (listCategory.length > 0) {
            const exportData = listCategory.map(brand => ({
                ...brand,
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, "ExportCategory.csv");
        }
    }


    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 15 }}>
            <span>Table Categorie</span>
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
                        dataSource={listCategory}
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
                <CategoryViewDetail
                    openViewDetail={openViewDetail}
                    setOpenViewDetail={setOpenViewDetail}
                    dataViewDetail={dataViewDetail}
                    setDataViewDetail={setDataViewDetail}
                    fetchCategory={fetchCategories}
                />
                <CategoryCreate
                    openModalCreate={openModalCreate}
                    setOpenModalCreate={setOpenModalCreate}
                    fetchCategory={fetchCategories}
                />
                {/*<CategoryImport*/}
                {/*    openModalImport={openModalImport}*/}
                {/*    setOpenModalImport={setOpenModalImport}*/}
                {/*    fetchCategory={fetchCategories()}*/}
                {/*/>*/}
                <CategoryUpdate
                    openModalUpdate={openModalUpdate}
                    setOpenModalUpdate={setOpenModalUpdate}
                    dataUpdate={dataUpdate}
                    setDataUpdate={setDataUpdate}
                    fetchCategory={fetchCategories}
                />
            </Row>
        </>
    );
};

export default CategoryTable;
