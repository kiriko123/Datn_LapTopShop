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
import { callDeleteSlider, callFetchListSlider } from "../../../services/api.js";
import { FaEye } from "react-icons/fa";
import InputSearch from './InputSearch.jsx';
import SliderViewDetail from "./SliderViewDetail.jsx";
import SliderModalCreate from "./SliderModalCreate.jsx";
import * as XLSX from "xlsx";
import SliderModalUpdate from "./SliderModalUpdate.jsx";
import moment from "moment/moment.js";
const SliderTable = () => {
    const [listSlider, setListSlider] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
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
        fetchSliders();
    }, [current, pageSize, filter, sortQuery]);

    const fetchSliders = async () => {
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}`;
        if (filter) query += `&${filter}`;
        if (sortQuery) query += `&${sortQuery}`;
        const res = await callFetchListSlider(query);
        if (res && res.data) {
            setListSlider(res.data.result);
            setTotal(res.data.meta.total);
        }
        setIsLoading(false);
    };

    const [selectedColumns, setSelectedColumns] = useState({
        id: true,
        title: true,
        description: true,
        imgUrl: true,
        createdAt: false,
        updatedAt: false,
        createdBy: false,
        updatedBy: false,
        action: true,
    });

    const [dropdownVisible, setDropdownVisible] = useState(false);

    const handleMenuClick = () => { };
    const handleVisibleChange = (flag) => {
        setDropdownVisible(flag);
    };

    const columnSelector = (
        <Menu
            onClick={handleMenuClick}
            style={{ maxHeight: '300px', overflowY: 'auto', width: '200px' }}
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
        selectedColumns.title && {
            title: 'Title',
            dataIndex: 'title',
            sorter: true,
        },
        selectedColumns.description && {
            title: 'Description',
            dataIndex: 'description',
            sorter: true,
        },
        selectedColumns.imgUrl && {
            title: 'Image',
            dataIndex: 'imgUrl',
            render: (text, record) => (
                <Image
                    width={100}
                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/slider/${record.imgUrl}`}
                    preview={{
                        src: `${import.meta.env.VITE_BACKEND_URL}/storage/slider/${record.imgUrl}`,
                    }}
                />
            ),
        },
        selectedColumns.createdAt && {
            title: 'Created At',
            dataIndex: 'createdAt',
            render: (item) => {
                return moment(item).format('DD-MM-YYYY hh:mm:ss');
            },
            sorter: true,
        },
        selectedColumns.updatedAt && {
            title: 'Updated At',
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
                        title="Confirm delete slider"
                        onConfirm={() => handleDeleteSlider(record.id)}
                        okText="Confirm"
                        cancelText="Cancel"
                    >
                        <DeleteTwoTone twoToneColor="#ff4d4f" style={{ cursor: 'pointer' }} />
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

    const handleDeleteSlider = async (sliderId) => {
        const res = await callDeleteSlider(sliderId);
        if (res?.data?.statusCode === 204) {
            message.success('Slider deleted successfully');
            fetchSliders();
        } else {
            notification.error({
                message: 'Error occurred',
                description: res.message,
            });
        }
    };

    const handleExportData = () => {
        if (listSlider.length > 0) {
            const exportData = listSlider.map(slider => ({
                ...slider,
            }));
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, "ExportSlider.csv");
        }
    };

    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 15 }}>
            <span>Danh sách Sliders</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
                <Dropdown
                    overlay={columnSelector}
                    trigger={['click']}
                    visible={dropdownVisible}
                    onVisibleChange={handleVisibleChange}
                >
                    <Button icon={<EditTwoTone />} type="primary">Select Columns</Button>
                </Dropdown>
                <Button icon={<ExportOutlined />} type="primary" onClick={handleExportData}>Export</Button>
                <Button icon={<CloudUploadOutlined />} type="primary">Import</Button>
                <Button icon={<PlusOutlined />} type="primary" onClick={() => setOpenModalCreate(true)}>Add New</Button>
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
                        dataSource={listSlider}
                        onChange={onChange}
                        rowKey="id"
                        pagination={{
                            current,
                            pageSize,
                            showSizeChanger: true,
                            total,
                            showTotal: (total, range) => <div>{range[0]}-{range[1]} of {total} items</div>,
                        }}
                    />
                </Col>
                <SliderViewDetail
                    openViewDetail={openViewDetail}
                    setOpenViewDetail={setOpenViewDetail}
                    dataViewDetail={dataViewDetail}
                    setDataViewDetail={setDataViewDetail}
                />
                <SliderModalCreate
                    openModalCreate={openModalCreate}
                    setOpenModalCreate={setOpenModalCreate}
                    fetchSliders={fetchSliders}
                />
                <SliderModalUpdate
                    open={openModalUpdate}
                    setOpen={setOpenModalUpdate}
                    dataUpdate={dataUpdate}
                    setDataUpdate={setDataUpdate}
                    fetchSliders={fetchSliders}
                />
            </Row>
        </>
    );
};

export default SliderTable;
