import React from 'react';
import { Button, Col, Form, Input, Row, theme } from 'antd';

const InputSearchVoucher = (props) => {
    const { token } = theme.useToken();
    const [form] = Form.useForm();

    const formStyle = {
        maxWidth: '100%',
        padding: '20px',
        background: '#fff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        color: '#222',
        fontWeight: 'bold',
        marginBottom: '24px',
        borderRadius: '20px',
    };

    const onFinish = (values) => {
        let queryParts = [];

        if (values.code) {
            queryParts.push(`voucherCode~%27${values.code}%27`);
        }
        if (values.discount) {
            queryParts.push(`voucherValue~%27${values.discount}%27`);
        }
        if (values.startDate) {
            queryParts.push(`startDate~%27${values.startDate}%27`);
        }
        if (values.endDate) {
            queryParts.push(`endDate~%27${values.endDate}%27`);
        }

        if (queryParts.length > 0) {
            const query = `filter=${queryParts.join('%20and%20')}`;
            console.log("Search query:", query);
            props.handleSearch(query);
        }
    };

    return (
        <Form form={form} name="advanced_search_voucher" style={formStyle} onFinish={onFinish}>
            <Row gutter={24}>
                {/* Mã Voucher */}
                <Col span={6}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name="code"
                        label="Mã Voucher"
                    >
                        <Input placeholder="Nhập mã voucher!" />
                    </Form.Item>
                </Col>

                {/* Giá trị giảm giá */}
                <Col span={6}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name="discount"
                        label="Giảm Giá (%)"
                    >
                        <Input type="number" placeholder="Nhập tỷ lệ giảm giá!" />
                    </Form.Item>
                </Col>

                {/* Ngày Bắt Đầu */}
                <Col span={6}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name="startDate"
                        label="Ngày Bắt Đầu"
                    >
                        <Input type="date" placeholder="Chọn ngày bắt đầu!" />
                    </Form.Item>
                </Col>

                {/* Ngày Kết Thúc */}
                <Col span={6}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name="endDate"
                        label="Ngày Kết Thúc"
                    >
                        <Input type="date" placeholder="Chọn ngày kết thúc!" />
                    </Form.Item>
                </Col>
            </Row>

            <Row>
                <Col span={24} style={{ textAlign: 'right' }}>
                    <Button type="primary" htmlType="submit">
                        Tìm Kiếm
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

export default InputSearchVoucher;
