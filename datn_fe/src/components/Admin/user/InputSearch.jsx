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

        // Thay đổi trường tìm kiếm cho phù hợp với Slider
        if (values.title) {
            queryParts.push(`title~%27${values.title}%27`);
        }
        if (values.description) {
            queryParts.push(`description~%27${values.description}%27`);
        }
        if (values.imgUrl) {
            queryParts.push(`imgUrl~%27${values.imgUrl}%27`);
        }

        // Không cần các trường khác trong Slider entity
        // if (values.enabled) {
        //     queryParts.push(`enabled~%27${values.enabled}%27`);
        // }
        // if (values.role) {
        //     queryParts.push(`role.id~%27${values.role}%27`);
        // }
        // if (values.gender) {
        //     queryParts.push(`gender:%27${values.gender}%27`);
        // }

        if (queryParts.length > 0) {
            const query = `filter=${queryParts.join('%20and%20')}`;
            console.log("Search query:", query);
            props.handleSearch(query);
        }
    };

    return (
        <Form form={form} name="advanced_search" style={formStyle} onFinish={onFinish}>
            <Row gutter={24}>

                <Col span={8}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`title`}
                        label={`Title`}
                    >
                        <Input placeholder="Please input title!" />
                    </Form.Item>
                </Col>

                <Col span={8}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`description`}
                        label={`Description`}
                    >
                        <Input placeholder="Please input description!" />
                    </Form.Item>
                </Col>

                <Col span={8}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`imgUrl`}
                        label={`Image URL`}
                    >
                        <Input placeholder="Please input image URL!" />
                    </Form.Item>
                </Col>

            </Row>
            <Row>
                <Col span={24} style={{ textAlign: 'right' }}>
                    <Button type="primary" htmlType="submit">
                        Search
                    </Button>
                    <Button
                        style={{ margin: '0 8px' }}
                        onClick={() => {
                            form.resetFields();
                            props.setFilter("");
                        }}
                    >
                        Clear
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

export default InputSearch;
