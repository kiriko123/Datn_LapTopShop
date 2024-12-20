import React, { useState } from 'react';
import {Button, Col, DatePicker, Form, Input, message, Row, Select, theme} from 'antd';
const { Option } = Select;

const InputSearch = (props) => {
    const { token } = theme.useToken();
    const [form] = Form.useForm();

    const formStyle = {
        maxWidth: '100%',
        padding: '20px',
        background: `#fff`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        color: token.colorTextBase,
        fontWeight: 'bold',
        marginBottom: '24px',
        borderRadius: '20px',
    };

    const onFinish = (values) => {
        let queryParts = [];
        if (values.orderNumber) {
            queryParts.push(`orderNumber~%27${values.orderNumber}%27`);
        }
        if (values.receiverName) {
            queryParts.push(`receiverName~%27${values.receiverName}%27`);
        }
        if (values.receiverAddress) {
            queryParts.push(`receiverAddress~%27${values.receiverAddress}%27`);
        }
        if (values.status) {
            queryParts.push(`status~%27${values.status}%27`);
        }
        if (values.paymentMethod) {
            queryParts.push(`paymentMethod~%27${values.paymentMethod}%27`);
        }
        if (values.startdate && values.enddate) {
            const startDateFormatted = values.startdate.format('YYYY-MM-DDTHH:mm:ss');
            const endDateFormatted = values.enddate.format('YYYY-MM-DDTHH:mm:ss');
            queryParts.push(`createdAt >: '${startDateFormatted}' and createdAt <: '${endDateFormatted}'`);
        } else if (values.startdate || values.enddate) {
            message.error("Both start date and end date must be filled in.");
            return;
        }
        if (queryParts.length > 0) {
            const query = `filter=${queryParts.join('%20and%20')}`;
            console.log("Search query:", query);
            props.handleSearch(query);
        }

    };

    return (
        <Form form={form} name="advanced_search" style={formStyle} onFinish={onFinish}>
            <Row gutter={24} justify={"center"}>
            <Col xs={12} sm={12} md={12} lg={5}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`orderNumber`}
                        label={`Mã đơn hàng`}
                    >
                        <Input placeholder="Nhập MaDH!" />
                    </Form.Item>
                </Col>

                <Col xs={12} sm={12} md={12} lg={5}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`receiverName`}
                        label={`Người nhận`}
                    >
                        <Input placeholder="Nhập người nhận!" />
                    </Form.Item>
                </Col>

                <Col xs={12} sm={12} md={12} lg={6}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`receiverAddress`}
                        label={`Địa chỉ`}
                    >
                        <Input placeholder="Nhập địa chỉ nhận hàng!" />
                    </Form.Item>
                </Col>

                <Col xs={12} sm={12} md={12} lg={6}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`status`}
                        label={`Trạng thái`}
                    >
                        <Select
                            placeholder="Chọn trạng thái"
                            onChange={(value) => {
                                // Lấy giá trị form hiện tại
                                const values = form.getFieldsValue();
                                // Cập nhật trạng thái mới
                                values.status = value;
                                // Gọi hàm onFinish để search luôn
                                onFinish(values);
                            }}
                        >

                            <Option value="PENDING">Chờ xác nhận</Option>
                            <Option value="PROCESSING">Đang xử lý</Option>
                            <Option value="SHIPPING">Đang giao hàng</Option>
                            <Option value="DELIVERED">Đã giao hàng</Option>
                            <Option value="CANCELLED">Hủy đơn hàng</Option>
                        </Select>
                    </Form.Item>
                </Col>

                {/*<Col xs={12} sm={12} md={12} lg={6}>*/}
                {/*    <Form.Item*/}
                {/*        labelCol={{ span: 24 }}*/}
                {/*        name={`status`}*/}
                {/*        label={`Trạng thái`}*/}
                {/*    >*/}
                {/*        <Select placeholder="Chọn trạng thái">*/}
                {/*            <Option value="PENDING">PENDING</Option>*/}
                {/*            <Option value="PROCESSING">PROCESSING</Option>*/}
                {/*            <Option value="SHIPPING">SHIPPING</Option>*/}
                {/*            <Option value="DELIVERED">DELIVERED</Option>*/}
                {/*            <Option value="CANCELLED">CANCELLED</Option>*/}
                {/*        </Select>*/}
                {/*    </Form.Item>*/}
                {/*</Col>*/}

                <Col xs={12} sm={12} md={12} lg={6}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`paymentMethod`}
                        label={`Phương thức thanh toán`}
                    >
                        <Input placeholder="Nhập phương thức thanh toán!" />
                    </Form.Item>
                </Col>
                <Col xs={12} sm={12} md={12} lg={6}>
                    <Form.Item
                        label="Ngày bắt đầu"
                        name="startdate"
                        labelCol={{ span: 24 }}
                    >
                        <DatePicker
                            showTime
                            format="YYYY-MM-DDTHH:mm:ss"
                            size="small"  // Kích thước nhỏ
                            className="border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 w-full"
                        />
                    </Form.Item>
                </Col>
                <Col xs={12} sm={12} md={12} lg={6}>
                    <Form.Item
                        label="Ngày kết thúc"
                        name="enddate"
                        labelCol={{ span: 24 }}
                    >
                        <DatePicker
                            showTime
                            format="YYYY-MM-DDTHH:mm:ss"
                            size="small"  // Kích thước nhỏ
                            className="border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 w-full"
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row>
                <Col span={24} style={{ textAlign: 'right' }}>
                    <Button type="primary" htmlType="submit">
                        Tìm kiếm
                    </Button>
                    <Button
                        style={{ margin: '0 8px' }}
                        onClick={() => {
                            form.resetFields();
                            props.setFilter("");
                        }}
                    >
                        Xóa
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

export default InputSearch;