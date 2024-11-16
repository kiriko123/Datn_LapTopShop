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
import { callDeleteUser, callFetchListUser } from "../../../services/api.js";
import { FaEye } from "react-icons/fa";
import InputSearch from './InputSearch';
import UserViewDetail from "./UserViewDetail.jsx";
import UserModalCreate from "./UserModalCreate.jsx";
import UserImport from "./data/UserImport.jsx";
import * as XLSX from "xlsx";
import UserModalUpdate from "./UserModalUpdate.jsx";

const UserTable = () => {
    const [listUser, setListUser] = useState([]);
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
        fetchUsers();
    }, [current, pageSize, filter, sortQuery]);

    const fetchUsers = async () => {
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}`;
        if (filter) query += `&${filter}`;
        if (sortQuery) query += `&${sortQuery}`;
        const res = await callFetchListUser(query);
        if (res && res.data) {
            setListUser(res.data.result);
            setTotal(res.data.meta.total);
        }
        setIsLoading(false);
    };

    const [selectedColumns, setSelectedColumns] = useState({
        id: true,
        name: true,
        email: true,
        age: true,
        firstName: true,
        gender: true,
        address: false,
        role: true,
        phoneNumber: true,
        enabled: false,
        imageUrl: false,
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
        selectedColumns.firstName && {
            title: 'Firstname',
            dataIndex: 'firstName',
            sorter: true,
        },
        selectedColumns.name && {
            title: 'Lastname',
            dataIndex: 'name',
            sorter: true,
        },
        selectedColumns.email && {
            title: 'Email',
            dataIndex: 'email',
            sorter: true,
        },
        selectedColumns.age && {
            title: 'Age',
            dataIndex: 'age',
            sorter: true,
        },
        selectedColumns.gender && {
            title: 'Gender',
            dataIndex: 'gender',
            sorter: true,
        },
        selectedColumns.address && {
            title: 'Address',
            dataIndex: 'address',
            sorter: true,
        },
        selectedColumns.phoneNumber && {
            title: 'Phone number',
            dataIndex: 'phoneNumber',
            sorter: true,
        },
        selectedColumns.enabled && {
            title: 'Enabled',
            dataIndex: 'enabled',
            sorter: true,
            render: (enabled) => (enabled ? 'Enabled' : 'Disabled'), // Chuyển đổi giá trị true/false
        },
        selectedColumns.imageUrl && {
            title: 'ImageUrl',
            dataIndex: 'imageUrl',
            sorter: true,
        },
        selectedColumns.createdAt && {
            title: 'CreatedAt',
            dataIndex: 'createdAt',
            sorter: true,
        },
        selectedColumns.updatedAt && {
            title: 'UpdatedAt',
            dataIndex: 'updatedAt',
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
        selectedColumns.role && {
            title: 'Role',
            dataIndex: ['role', 'name'],
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
                        title="Xác nhận xóa user"
                        description="Bạn có chắc chắn muốn xóa user này?"
                        onConfirm={() => handleDeleteUser(record.id)}
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

    const handleDeleteUser = async (userId) => {
        const res = await callDeleteUser(userId);
        if (res?.data?.statusCode === 204) {
            message.success('Xóa user thành công');
            fetchUsers();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message,
            });
        }
    };

    const handleExportData = () => {
        if (listUser.length > 0) {
            // Tạo bản sao của listUser và điều chỉnh dữ liệu trước khi xuất
            const exportData = listUser.map(user => ({
                ...user,
                role: user.role?.name || '', // Lấy giá trị từ role.name hoặc để trống nếu không có
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, "ExportUser.csv");
        }
    }


    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 15 }}>
            <span>Table Users</span>
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
                <Button icon={<CloudUploadOutlined />} type="primary" onClick={() => setOpenModalImport(true)}>Import</Button>
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
                        dataSource={listUser}
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
                <UserViewDetail
                    openViewDetail={openViewDetail}
                    setOpenViewDetail={setOpenViewDetail}
                    dataViewDetail={dataViewDetail}
                    setDataViewDetail={setDataViewDetail}
                />
                <UserModalCreate
                    openModalCreate={openModalCreate}
                    setOpenModalCreate={setOpenModalCreate}
                    fetchUser={fetchUsers}
                />
                <UserImport
                    openModalImport={openModalImport}
                    setOpenModalImport={setOpenModalImport}
                    fetchUser={fetchUsers}
                />
                <UserModalUpdate
                    openModalUpdate={openModalUpdate}
                    setOpenModalUpdate={setOpenModalUpdate}
                    dataUpdate={dataUpdate}
                    setDataUpdate={setDataUpdate}
                    fetchUser={fetchUsers}
                />
            </Row>
        </>
    );
};

export default UserTable;
