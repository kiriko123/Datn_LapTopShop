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
        <div style={{ minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <Row justify="center">
                <Col span={24}> {/* Tăng chiều rộng lên 12 cột, bạn có thể tăng thêm nếu muốn */}
                    <Form
                        name="changePassword"
                        onFinish={onFinish}
                        autoComplete="off"
                        form={form}
                        layout="vertical"
                        style={{
                            backgroundColor: "#fff",
                            padding: "20px",
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            width: "50vw" // Đặt chiều rộng cố định lớn hơn
                        }}
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            initialValue={user?.email}
                            rules={[{ required: true, message: "Email không được để trống!" }]}
                        >
                            <Input disabled style={{ borderRadius: "8px" }} />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu hiện tại"
                            name="password"
                            rules={[{ required: true, message: "Mật khẩu không được để trống!" }]}
                        >
                            <Input.Password style={{ borderRadius: "8px" }} />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[
                                { required: true, message: "Mật khẩu mới không được để trống!" },
                                { min: 6, message: "Mật khẩu mới phải có ít nhất 6 ký tự!" },
                            ]}
                        >
                            <Input.Password style={{ borderRadius: "8px" }} />
                        </Form.Item>

                        <Form.Item
                            label="Nhập lại mật khẩu mới"
                            name="confirmPassword"
                            rules={[{ required: true, message: "Nhập lại mật khẩu không được để trống!" }]}
                        >
                            <Input.Password style={{ borderRadius: "8px" }} />
                        </Form.Item>

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