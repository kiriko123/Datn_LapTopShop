import { AntDesignOutlined, UploadOutlined } from "@ant-design/icons";
import {Avatar, Button, Col, Form, Input, Row, Upload, message, notification, InputNumber, Radio, Modal} from "antd";
import { useDispatch, useSelector } from "react-redux";
import React, { useState } from "react";
import { callUpdateInfo, callUploadFile } from "../../services/api.js";
import { doUpdateUserInfoAction, doUploadAvatarAction } from "../../redux/account/accountSlice.js";

const UserInfo = (props) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const user = useSelector(state => state.account.user);
    const tempAvatar = useSelector(state => state.account.tempAvatar);

    const [userAvatar, setUserAvatar] = useState(user?.imageUrl ?? "");
    const [isSubmit, setIsSubmit] = useState(false);

    const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${tempAvatar || user?.imageUrl}`;

    const [previewOpen, setPreviewOpen] = useState(false);

    const handleUploadAvatar = async ({ file, onSuccess, onError }) => {
        const res = await callUploadFile(file, 'avatar');
        if(res && res.data){
            const newAvatar = res.data.fileName;
            dispatch(doUploadAvatarAction({ avatar: newAvatar }));
            setUserAvatar(newAvatar);
            onSuccess('ok');
        } else {
            onError('Đã có lỗi khi upload file');
        }
    };

    const propsUpload = {
        maxCount: 1,
        multiple: false,
        showUploadList: false,
        customRequest: handleUploadAvatar,
        onChange(info) {
            if (info.file.status === 'done') {
                message.success(`Upload file thành công`);
            } else if (info.file.status === 'error') {
                message.error(`Upload file thất bại`);
            }
        },
    };

    const onFinish = async (values) => {
        const { id, firstName, name, gender, age, phoneNumber, address } = values;
        setIsSubmit(true);
        const res = await callUpdateInfo({ id, firstName, name, userAvatar, gender, age, phoneNumber, address });
        if (res && res.data) {
            dispatch(doUpdateUserInfoAction({ id, firstName, name, imageUrl: userAvatar, gender, age, phoneNumber, address }));
            notification.success({
                message: "Cập nhật thông tin tài khoản thành công",
            });
        } else {
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: res.message
            });
        }
        setIsSubmit(false);
    };

    const handleCancel = () => setPreviewOpen(false);
    const handlePreview = async (file) => {
        setPreviewOpen(true);
    };

    return (
        <div style={{minHeight: 400, padding: '20px', background: '#fff', borderRadius: '8px'}}>
            <Row gutter={40} style={{justifyContent: 'center'}}>
                <Col sm={24}
                     style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px'}}>
                    <Avatar
                        size={150}
                        icon={<AntDesignOutlined/>}
                        src={urlAvatar}
                        shape="circle"
                        onClick={handlePreview}
                        style={{marginBottom: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'}}
                    />
                    <Upload {...propsUpload}>
                        <Button icon={<UploadOutlined/>} type="primary"
                                style={{backgroundColor: '#1890ff', borderRadius: '8px'}}>
                            Upload Avatar
                        </Button>
                    </Upload>
                </Col>
                <Col sm={24}>
                    <Form
                        name="basic"
                        onFinish={onFinish}
                        form={form}
                        style={{backgroundColor: '#fff', padding: '0px', borderRadius: '8px'}}
                    >
                        <Row gutter={15}>
                            <Col xs={24} sm={24}>
                                <Form.Item
                                    hidden
                                    label="Id"
                                    name="id"
                                    initialValue={user?.id}
                                >
                                    <Input disabled hidden/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    initialValue={user?.email}
                                    labelCol={{ span: 24 }}
                                >
                                    <Input disabled style={{borderRadius: '8px'}}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Form.Item
                                    label="Tên"
                                    name="firstName"
                                    initialValue={user?.firstName}
                                    labelCol={{ span: 24 }}
                                    rules={[{required: true, message: 'Tên không được để trống!'}]}
                                >
                                    <Input style={{borderRadius: '8px'}}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Form.Item
                                    label="Họ"
                                    name="name"
                                    initialValue={user?.name}
                                    labelCol={{ span: 24 }}
                                    rules={[{required: true, message: 'Họ không được để trống!'}]}
                                >
                                    <Input style={{borderRadius: '8px'}}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Form.Item
                                    label="Giới tính"
                                    name="gender"
                                    initialValue={user?.gender}
                                    rules={[{required: true, message: 'Vui lòng chọn giới tính!'}]}
                                    labelCol={{ span: 24 }}
                                >
                                    <Radio.Group>
                                        <Radio value="MALE">Nam</Radio>
                                        <Radio value="FEMALE">Nữ</Radio>
                                        <Radio value="OTHER">Khác</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Form.Item
                                    label="Số điện thoại"
                                    name="phoneNumber"
                                    initialValue={user?.phoneNumber}
                                    labelCol={{ span: 24 }}
                                    rules={[{required: true, message: 'Số điện thoại không được để trống!'}]}
                                >
                                    <Input style={{borderRadius: '8px'}}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Form.Item
                                    label="Tuổi"
                                    name="age"
                                    initialValue={user?.age}
                                    labelCol={{ span: 24 }}
                                    rules={[{required: true, message: 'Vui lòng nhập tuổi!'}]}
                                >
                                    <InputNumber min={0} max={120} style={{width: '100%', borderRadius: '8px'}}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24}>
                                <Form.Item
                                    label="Địa chỉ"
                                    name="address"
                                    initialValue={user?.address}
                                    labelCol={{ span: 24 }}
                                    rules={[{required: true, message: 'Địa chỉ không được để trống!'}]}
                                >
                                    <Input style={{borderRadius: '8px'}}/>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Button loading={isSubmit} onClick={() => form.submit()} type="primary"
                                style={{width: '100%', borderRadius: '8px', backgroundColor: '#1890ff'}}>
                            Cập nhật
                        </Button>
                    </Form>
                </Col>
            </Row>
            <Modal open={previewOpen} title={urlAvatar} footer={null} onCancel={handleCancel} centered>
                <img alt="example" style={{width: '100%'}} src={urlAvatar}/>
            </Modal>
        </div>

    );
};

export default UserInfo;
