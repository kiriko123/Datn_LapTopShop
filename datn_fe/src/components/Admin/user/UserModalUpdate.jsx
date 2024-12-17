import React, { useEffect, useState } from 'react';
import {Button, Col, Divider, Form, Input, InputNumber, message, Modal, notification, Row, Radio} from 'antd';
import { callUpdateUser } from '../../../services/api';

const UserModalUpdate = (props) => {
    const { openModalUpdate, setOpenModalUpdate, dataUpdate, setDataUpdate } = props;
    const [isSubmit, setIsSubmit] = useState(false);

    // https://ant.design/components/form#components-form-demo-control-hooks
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        const { id, name, firstName, email, age, gender, address, phoneNumber, enabled } = values;
        setIsSubmit(true)
        const res =
            await callUpdateUser({id, name, firstName, email, age, gender, address, phoneNumber, enabled});
        if (res && res.data) {
            message.success('Cập nhật user thành công');
            setOpenModalUpdate(false);
            await props.fetchUser()
        } else {
            notification.error({
                message: 'Đã có lỗi xảy ra',
                description: res.message
            })
        }
        setIsSubmit(false)
    };

    useEffect(() => {
        form.setFieldsValue(dataUpdate)
    }, [dataUpdate])

    return (
        <>

            <Modal
                title="Cập nhật người dùng"
                open={openModalUpdate}
                onOk={() => { form.submit() }}
                onCancel={() => {
                    setOpenModalUpdate(false);
                    setDataUpdate(null);
                }}
                okText={"Cập nhật"}
                cancelText={"Hủy"}
                confirmLoading={isSubmit}
            >
                <Divider />

                <Form
                    form={form}
                    name="basic"
                    style={{ maxWidth: 600 }}
                    onFinish={onFinish}
                    autoComplete="off"
                    // initialValues={dataUpdate}
                >
                    <Form.Item hidden labelCol={{ span: 24 }} label="Id" name="id"  rules={[{ required: true, message: 'Vui lòng nhập id!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item labelCol={{ span: 24 }} label="Email" name="email"  rules={[{ required: true, message: 'Vui lòng nhập email!' }]}>
                        <Input disabled/>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Firstname" name="firstName"  rules={[{ required: true, message: 'Vui lòng nhập firstname!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Lastname" name="name" rules={[{ required: true, message: 'Vui lòng nhập lastname!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Address" name="address" rules={[{ required: true, message: 'Address không được để trống!' }]}>
                        <Input />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Phone number" name="phoneNumber"
                                       rules={[
                                           { required: true, message: 'Phone number không được để trống!' },
                                           {
                                               pattern: /^((\+|)84|0)(3|5|7|8|9)+([0-9]{8})\b/,
                                               message: 'Số điện thoại không đúng định dạng!',
                                           },
                                       ]}>
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

                    <Form.Item
                        label="Enabled"
                        name="enabled"
                        rules={[{ required: true, message: 'Please select the status!' }]}
                    >
                        <Radio.Group>
                            <Radio value={true}>Enabled</Radio>
                            <Radio value={false}>Disable</Radio>
                        </Radio.Group>
                    </Form.Item>

                </Form>
            </Modal>
        </>
    );
};

export default UserModalUpdate;

