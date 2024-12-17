import { Button, Col, Form, Input, Row, message, notification } from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";
import { callChangePassword } from "../../services/api.js";

const ChangePassword = (props) => {
    const [form] = Form.useForm();
    const [isSubmit, setIsSubmit] = useState(false);
    const user = useSelector((state) => state.account.user);

    const onFinish = async (values) => {
        const { email, password, newPassword, confirmPassword } = values;

        if (newPassword !== confirmPassword) {
            notification.error({
                message: "Mật khẩu không khớp",
                description: "Mật khẩu mới và mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại!",
            });
            return;
        }

        setIsSubmit(true);
        const res = await callChangePassword({ email, password, newPassword, confirmPassword });

        if (res && res.data?.statusCode === 201) {
            message.success("Đổi mật khẩu thành công");
            form.resetFields();
        } else {
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: res.message || "Không thể đổi mật khẩu. Vui lòng thử lại sau!",
            });
        }

        setIsSubmit(false);
    };

    return (
        <div style={{ minHeight: 350, padding: "10px" }}>
            <Row justify="center">
                <Col span={24}> {/* Tăng chiều rộng lên 12 cột, bạn có thể tăng thêm nếu muốn */}
                    <Form
                        name="changePassword"
                        onFinish={onFinish}
                        autoComplete="off"

                        form={form}
                        style={{
                            backgroundColor: "#fff",
                            padding: "10px 0px 0px 0px",
                            borderRadius: "8px",
                            // width: "40vw" // Đặt chiều rộng cố định lớn hơn
                        }}
                    >
                        <Row gutter={16}>
                            <Col xs={24} sm={24}>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    labelCol={{ span: 24 }}
                                    initialValue={user?.email}
                                    rules={[{ required: true, message: "Email không được để trống!" }]}
                                >
                                    <Input disabled style={{ borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24}>
                                <Form.Item
                                    label="Mật khẩu hiện tại"
                                    name="password"
                                    labelCol={{ span: 24 }}
                                    rules={[
                                        { required: true, message: "Mật khẩu không được để trống!" },
                                        { min: 5, message: "Mật khẩu hiện tại phải có ít nhất 5 ký tự!" },
                                    ]}
                                >
                                    <Input.Password style={{ borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24}>
                                <Form.Item
                                    label="Mật khẩu mới"
                                    name="newPassword"
                                    labelCol={{ span: 24 }}
                                    rules={[
                                        { required: true, message: "Mật khẩu mới không được để trống!" },
                                        { min: 5, message: "Mật khẩu mới phải có ít nhất 5 ký tự!" },
                                    ]}
                                >
                                    <Input.Password style={{ borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24}>
                                <Form.Item
                                    label="Nhập lại mật khẩu mới"
                                    name="confirmPassword"
                                    labelCol={{ span: 24 }}
                                    dependencies={['newPassword']}
                                    rules={[
                                        { required: true, message: "Nhập lại mật khẩu không được để trống!" },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject('Mật khẩu mới và nhập lại mật khẩu phải giống nhau!');
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password style={{ borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                        </Row>


                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isSubmit}
                                style={{ width: "100%", borderRadius: "8px" }}
                            >
                                Xác nhận
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </div>
    );
};

export default ChangePassword;
