import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, Select, theme } from 'antd';


const { Option } = Select;

const InputSearch = (props) => {
    const { token } = theme.useToken();
    const [form] = Form.useForm();

    const formStyle = {
        maxWidth: '100%',
        padding: '20px',
        background: `#fff`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        color: '#222',
        fontWeight: 'bold',
        marginBottom: '24px',
        borderRadius: '20px',
    };

    const onFinish = (values) => {
        let queryParts = [];
        if (values.id) {
            queryParts.push(`id=${values.id}`);
        }
        if (values.name) {
            queryParts.push(`name~%27${values.name}%27`);
        }
        if (values.description) {
            queryParts.push(`description~%27${values.description}%27`);
        }
        if (values.createdBy) {
            queryParts.push(`createdBy~%27${values.createdBy}%27`);
        }
        if (values.updatedBy) {
            queryParts.push(`updatedBy~%27${values.updatedBy}%27`);
        }

        if (queryParts.length > 0) {
            const query = `filter=${queryParts.join('%20and%20')}`;
            console.log("Search query:", query);
            props.handleSearch(query);
        }
    };

    return (
        <Form form={form} name="advanced_search" style={formStyle} onFinish={onFinish}>
            <Row gutter={24}>
            <Col span={6}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`id`}
                        label={`ID`}
                    >
                        <Input placeholder="Vui lòng nhập id!" />
                    </Form.Item>
                </Col>

                <Col span={6}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`name`}
                        label={`Tên thương hiệu`}
                    >
                        <Input placeholder="Vui lòng nhập tên thương hiệu!" />
                    </Form.Item>
                </Col>

                <Col span={6}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`description`}
                        label={`Mô tả`}
                    >
                        <Input placeholder="Vui lòng nhập mô tả!" />
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
