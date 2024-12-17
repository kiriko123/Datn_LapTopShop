import React, { useState } from 'react';
import { Button, Col, Divider, Form, Input, InputNumber, message, Modal, notification, Radio, Row } from 'antd';
import { callCreateUser } from '../../../services/api';

const UserModalCreate = (props) => {
    const { openModalCreate, setOpenModalCreate } = props;
    const [isSubmit, setIsSubmit] = useState(false);

    // https://ant.design/components/form#components-form-demo-control-hooks
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        const { name, firstName, email, password, passwordConfirm, age, gender, address, phoneNumber } = values;
        setIsSubmit(true);
        const res =
            await callCreateUser({
                name, firstName, email,
                password, passwordConfirm, age, gender, address, phoneNumber
            });
        if (res && res.data) {
            message.success('Created successfully');
            form.resetFields();
            setOpenModalCreate(false);
            await props.fetchUser();
        } else {
            notification.error({
                message: 'Đã có lỗi xảy ra',
                description: res.message
            })
        }
        setIsSubmit(false);

    };

    return (
        <>

            <Modal
                title="Thêm mới người dùng"
                open={openModalCreate}
                onOk={() => {
                    form.submit()
                }}
                onCancel={() => setOpenModalCreate(false)}
                okText={"Tạo mới"}
                cancelText={"Hủy"}
                confirmLoading={isSubmit}
                centered
            >
                <Divider />

                <Form
                    form={form} //quy dinh Form la form khi submit cai model se submit form luon
                    name="basic"
                    style={{ maxWidth: 600 }}

                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không đúng định dạng!' },
                        ]}
                    >
                        <Input />
                    </Form.Item>


                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Firstname" name="firstName" rules={[{ required: true, message: 'Vui lòng nhập firstname!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Lastname" name="name" rules={[{ required: true, message: 'Vui lòng nhập lastname!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                    { min: 5, message: 'Mật khẩu phải có ít nhất 5 ký tự!' },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Password confirm"
                                name="passwordConfirm"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Vui lòng nhập password confirm!' },
                                    { min: 5, message: 'Mật khẩu phải có ít nhất 5 ký tự!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </Col>
                    </Row>


                    <Form.Item label="Address" name="address" rules={[{ required: true, message: 'Address không được để trống!' }]}>
                        <Input />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Phone number"
                                name="phoneNumber"
                                rules={[
                                    { required: true, message: 'Phone number không được để trống!' },
                                    {
                                        pattern: /^((\+|)84|0)(3|5|7|8|9)+([0-9]{8})\b/,
                                        message: 'Số điện thoại không đúng định dạng!',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                        </Col>
                        <Col span={12}>
                            <Form.Item label="Age" name="age" rules={[{ required: true, message: 'Please enter your age!' }]}>
                                <InputNumber min={16} max={80} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Gender"
                        name="gender"
                        initialValue={'MALE'}
                        rules={[{ required: true, message: 'Please select your gender!' }]}
                    >
                        <Radio.Group>
                            <Radio value="MALE">Male</Radio>
                            <Radio value="FEMALE">Female</Radio>
                            <Radio value="OTHER">Other</Radio>
                        </Radio.Group>
                    </Form.Item>

                </Form>
            </Modal>
        </>
    );
};

export default UserModalCreate;
