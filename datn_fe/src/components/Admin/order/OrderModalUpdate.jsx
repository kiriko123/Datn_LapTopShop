import React, { useEffect, useState } from 'react';
import { Select, Button, Col, Divider, Form, Input, InputNumber, message, Modal, notification, Row, Radio } from 'antd';
import { callAdminUpdateOrder, callFetchOrder, callUserUpdateOrder } from '../../../services/api';

const OrderModalUpdate = (props) => {
    const { openModalUpdate, setOpenModalUpdate, dataUpdate, setDataUpdate, fetchOrder } = props;
    const [isSubmit, setIsSubmit] = useState(false);
    const [validStatuses, setValidStatuses] = useState([]);

    const [form] = Form.useForm();


    // Hàm xác định trạng thái hợp lệ
    const getValidStatuses = (currentStatus) => {
        switch (currentStatus) {
            case 'PENDING':
                return ['PROCESSING', 'CANCELLED'];
            case 'PROCESSING':
                return ['SHIPPING', 'CANCELLED'];
            case 'SHIPPING':
                return ['DELIVERED', 'CANCELLED'];
            case 'DELIVERED':
                return []; // Không thể thay đổi trạng thái nếu đã giao hàng
            case 'CANCELLED':
                return []; // Không thể thay đổi trạng thái nếu đã hủy
            default:
                return [];
        }
    };

    const mapStatusToVietnamese = (status) => {
        switch (status) {
            case "PENDING":
                return "Chờ xác nhận";
            case "PROCESSING":
                return "Đang xử lý";
            case "SHIPPING":
                return "Đang giao hàng";
            case "DELIVERED":
                return "Đã giao hàng";
            case "CANCELLED":
                return "Hủy đơn hàng";
            default:
                return "Không xác định";
        }
    };


    const onFinish = async (values) => {
        const { newStatus, description, receiverAddress } = values;
        setIsSubmit(true);

        const res = await callAdminUpdateOrder({
            id: dataUpdate.id,
            address: receiverAddress,
            currentStatus: dataUpdate.status,
            newStatus,
            description
        });

        if (res && res.data) {
            message.success('Cập nhật thành công');
            setOpenModalUpdate(false);
            await fetchOrder(); // Cập nhật lại danh sách đơn hàng
        } else {
            notification.error({
                message: 'Đã có lỗi xảy ra',
                description: res.message
            });
        }
        setIsSubmit(false);
    };

    useEffect(() => {
        form.setFieldsValue({
            currentStatus: dataUpdate?.status, // Đặt giá trị mặc định là trạng thái hiện tại
            newStatus: mapStatusToVietnamese(dataUpdate?.status),
            description: dataUpdate?.description,
            receiverAddress: dataUpdate?.receiverAddress // Địa chỉ
        });

        if (dataUpdate?.status) {
            setValidStatuses(getValidStatuses(dataUpdate.status)); // Cập nhật trạng thái hợp lệ
        }
    }, [dataUpdate, form])

    return (
        <Modal
            title="Cập nhật đơn hàng"
            open={openModalUpdate}
            onOk={() => { form.submit() }} // Gọi onFinish khi người dùng click "Ok"
            onCancel={() => {
                setOpenModalUpdate(false);
                setDataUpdate(null);
            }}
            okText={"Cập nhật"}
            cancelText={"Hủy"}
            confirmLoading={isSubmit}
            centered
        >
            <Divider />

            <Form
                form={form}
                name="basic"
                style={{ maxWidth: 600 }}
                onFinish={onFinish}
                autoComplete="off"
            >
                {/* Hiển thị trạng thái hiện tại, không cho phép người dùng chỉnh sửa */}
                <Form.Item
                    labelCol={{ span: 24 }}
                    label="Trạng thái hiện tại"
                    name="currentStatus"
                >
                    {/*<Radio.Group disabled>*/}
                    {/*    <Radio value="PENDING">PENDING</Radio>*/}
                    {/*    <Radio value="PROCESSING">PROCESSING</Radio>*/}
                    {/*    <Radio value="SHIPPING">SHIPPING</Radio>*/}
                    {/*    <Radio value="DELIVERED">DELIVERED</Radio>*/}
                    {/*    <Radio value="CANCELLED">CANCELLED</Radio>*/}
                    {/*</Radio.Group>*/}
                    <Select disabled>
                        <Select.Option value={dataUpdate?.status}>
                            {mapStatusToVietnamese(dataUpdate?.status)}
                        </Select.Option>
                    </Select>
                </Form.Item>

                {/* Chọn trạng thái mới */}
                <Form.Item
                    labelCol={{ span: 24 }}
                    label="Trạng thái mới"
                    name="newStatus"
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái mới!' }]}
                >
                    <Select>
                        {validStatuses.map((status) => (
                            <Select.Option key={status} value={status}>
                                {mapStatusToVietnamese(status)}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    labelCol={{ span: 24 }}
                    label="Địa chỉ nhận hàng"
                    name="receiverAddress"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ nhận hàng!' }]}
                >
                    <Input />
                </Form.Item>

                {/* Mô tả */}
                <Form.Item
                    labelCol={{ span: 24 }}
                    label="Mô tả"
                    name="description"
                >
                    <Input.TextArea rows={4} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default OrderModalUpdate;