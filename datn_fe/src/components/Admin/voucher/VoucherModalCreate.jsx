import React, { useState } from 'react';
import { Col, Divider, Form, Input, InputNumber, message, Modal, notification, Radio, Row, DatePicker } from 'antd';
import { callCreateVoucher } from "../../../services/api.js"; 

const VoucherModalCreate = (props) => {
    const { openModalCreate, setOpenModalCreate, fetchVouchers } = props;
    const [isSubmit, setIsSubmit] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        const { voucherCode, voucherValue, startDate, endDate, active, description } = values;

        // Chuyển đổi startDate và endDate thành định dạng ISO
        const isoStartDate = new Date(startDate).toISOString();
        const isoEndDate = new Date(endDate).toISOString();

        setIsSubmit(true);
        
        try {
            const res = await callCreateVoucher({
                voucherCode,
                voucherValue,
                startDate: isoStartDate,
                endDate: isoEndDate,
                active,
                description, // Thêm mô tả vào yêu cầu
            });

            if (res && res.data) {
                message.success('Tạo mới voucher thành công');
                form.resetFields();
                setOpenModalCreate(false);
                await fetchVouchers();
            } else {
                notification.error({
                    message: 'Đã có lỗi xảy ra',
                    description: res.message || 'Vui lòng thử lại sau!',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Đã có lỗi xảy ra',
                description: error.message || 'Vui lòng thử lại sau!',
            });
        } finally {
            setIsSubmit(false);
        }
    };

    return (
        <Modal
            title="Thêm mới voucher"
            open={openModalCreate}
            onOk={() => form.submit()}
            onCancel={() => {
                form.resetFields();
                setOpenModalCreate(false);
            }}
            okText={"Tạo mới"}
            cancelText={"Hủy"}
            confirmLoading={isSubmit}
            centered
        >
            <Divider />
            <Form
                form={form}
                name="voucherForm"
                onFinish={onFinish}
                autoComplete="off"
            >
                <Row gutter={15}>
                    <Col xs={24} sm={12}>
                        <Form.Item label="Mã voucher" name="voucherCode" rules={[{ required: true, message: 'Vui lòng nhập mã voucher!' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item label="Giảm giá (%)" name="voucherValue" rules={[{ required: true, message: 'Vui lòng nhập giảm giá!' }]}>
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item label="Ngày bắt đầu" name="startDate" rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item label="Ngày kết thúc" name="endDate" rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col xs={24}>
                        <Form.Item label="Mô tả" name="description" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
                            <Input.TextArea rows={4} placeholder="Nhập mô tả cho voucher..." />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item label="Active" name="active" rules={[{ required: true, message: 'Vui lòng chọn!' }]}>
                            <Radio.Group>
                                <Radio value={true}>True</Radio>
                                <Radio value={false}>False</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default VoucherModalCreate;
