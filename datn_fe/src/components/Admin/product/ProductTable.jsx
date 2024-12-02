import React, {useEffect, useState} from 'react';
import {Table, Row, Col, Popconfirm, Button, message, notification, Dropdown, Checkbox, Menu} from 'antd';
import {
    ExportOutlined,
    CloudUploadOutlined,
    PlusOutlined,
    ReloadOutlined,
    DeleteTwoTone,
    EditTwoTone
} from '@ant-design/icons';
import {FaEye} from "react-icons/fa";
import InputSearch from './InputSearch';
import * as XLSX from "xlsx";
import {callDeleteProduct, callFetchProduct} from "../../../services/api.js";
import ProductViewDetail from "./ProductViewDetail.jsx";
import ProductModalCreate from "./ProductModelCreate.jsx";
import ProductModalUpdate from "./ProductModalUpdate.jsx";
import moment from "moment/moment.js";

const BookTable = () => {
    const [listProduct, setListProduct] = useState([]);
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

    useEffect(() => {
        fetchProduct()
    }, [current, pageSize, filter, sortQuery]);

    const fetchProduct = async () => {
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}`;
        if (filter) query += `&${filter}`;
        if (sortQuery) query += `&${sortQuery}`;

        const res = await callFetchProduct(query);

        if (res && res.data) {
            console.log(res)
            setListProduct(res.data.result);
            setTotal(res.data.meta.total);
        }
        setIsLoading(false)
    }

    const [selectedColumns, setSelectedColumns] = useState({
        id: true,
        name: true,
        brand: true,
        price: true,
        quantity: true,
        sold: true,
        discount: true,
        sale: true,
        hot: true,
        active: true,
        category: true,
        description: true,
        createdAt: true,
        updatedAt: false,
        createdBy: true,
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
        <Menu onClick={handleMenuClick} style={{maxHeight: '200px', overflowY: 'scroll'}}>
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
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            sorter: true,
        },
        selectedColumns.category && {
            title: 'Danh mục',
            dataIndex: ['category', 'name'],
            sorter: true,
        },
        selectedColumns.brand && {
            title: 'Thương hiệu',
            dataIndex: ['brand', 'name'],
            sorter: true,
        },
        selectedColumns.price && {
            title: 'Giá',
            dataIndex: 'price',
            sorter: true,
        },
        selectedColumns.quantity && {
            title: 'Số lượng',
            dataIndex: 'quantity',
            sorter: true,
        },
        selectedColumns.sold && {
            title: 'Đã bán',
            dataIndex: 'sold',
            sorter: true,
        },
        selectedColumns.discount && {
            title: 'Giảm giá',
            dataIndex: 'discount',
            sorter: true,
        },
        selectedColumns.sale && {
            title: 'Sale',
            dataIndex: 'sale',
            sorter: true,
            render: (active) => (active ? 'Sale' : 'Not sale'), // Chuyển đổi giá trị true/false
        },
        selectedColumns.hot && {
            title: 'Hot',
            dataIndex: 'hot',
            sorter: true,
            render: (active) => (active ? 'Hot' : 'Not hot'), // Chuyển đổi giá trị true/false
        },
        selectedColumns.active && {
            title: 'Kích hoạt',
            dataIndex: 'active',
            sorter: true,
            render: (active) => (active ? 'Active' : 'Disabled'), // Chuyển đổi giá trị true/false
        },
        selectedColumns.description && {
            title: 'Mô tả',
            dataIndex: 'description',
            sorter: true,
            render: (text) =>{
                return text.length > 50 ? `${text.slice(0, 50)}...` : text;
            },
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
                <div style={{display: 'flex', alignItems: 'center', gap: 15}}>
                    <FaEye style={{cursor: 'pointer'}} onClick={() => {
                        setDataViewDetail(record);
                        setOpenViewDetail(true);
                    }}/>
                    <Popconfirm
                        placement="leftTop"
                        title="Xác nhận xóa sản phẩm"
                        description="Bạn có chắc chắn muốn xóa sản phẩm này?"
                        onConfirm={() => handleDeleteBook(record.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <span style={{cursor: 'pointer'}}>
                            <DeleteTwoTone twoToneColor="#ff4d4f"/>
                        </span>
                    </Popconfirm>
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

    const handleDeleteBook = async (productId) => {
        const res = await callDeleteProduct(productId);
        if (res?.data?.statusCode === 204) {
            message.success('Xóa sản phẩm thành công');
            await fetchProduct()
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message,
            });
        }
    };

    const handleExportData = () => {
        if (listProduct.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(listProduct);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, "ExportProduct.csv");
        }
    }

    const renderHeader = () => (
        <div style={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 15}}>
            <span>Table Products</span>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 15}}>
                <Dropdown
                    overlay={columnSelector}
                    trigger={['click']}
                    visible={dropdownVisible} // Điều khiển trạng thái hiển thị của dropdown
                    onVisibleChange={handleVisibleChange} // Xử lý khi nhấn ra ngoài thì đóng menu
                >
                    <Button icon={<EditTwoTone/>} type="primary">Select Columns</Button>
                </Dropdown>
                <Button icon={<ExportOutlined/>} type="primary" onClick={() => handleExportData()}>Export</Button>

                <Button icon={<PlusOutlined/>} type="primary" onClick={() => setOpenModalCreate(true)}>Thêm mới</Button>
                <Button type="ghost" onClick={() => {
                    setFilter("");
                    setSortQuery("");
                }}>
                    <ReloadOutlined/>
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
                                 setFilter={setFilter}/>
                </Col>
                <Col span={24}>
                    <Table
                        title={renderHeader}
                        loading={isLoading}
                        columns={columns}
                        dataSource={listProduct}
                        onChange={onChange}
                        rowKey="id"
                        scroll={{ x: 800 }} // Enables horizontal scrolling
                        pagination={{
                            current,
                            pageSize,
                            showSizeChanger: true,
                            total,
                            showTotal: (total, range) => <div>{range[0]}-{range[1]} trên {total} rows</div>,
                        }}
                    />
                </Col>
                <ProductViewDetail
                    openViewDetail={openViewDetail}
                    setOpenViewDetail={setOpenViewDetail}
                    dataViewDetail={dataViewDetail}
                    setDataViewDetail={setDataViewDetail}
                />
                <ProductModalCreate
                    openModalCreate={openModalCreate}
                    setOpenModalCreate={setOpenModalCreate}
                    fetchProduct={fetchProduct}
                />
                <ProductModalUpdate
                    openModalUpdate={openModalUpdate}
                    setOpenModalUpdate={setOpenModalUpdate}
                    dataUpdate={dataUpdate}
                    setDataUpdate={setDataUpdate}
                    fetchProduct={fetchProduct}
                />
            </Row>
        </>
    );
};

export default BookTable;

