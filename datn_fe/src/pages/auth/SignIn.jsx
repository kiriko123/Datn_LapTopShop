import React, { useEffect, useState } from "react";
import { Form, Input, Button, Checkbox, message, notification } from "antd";
import { LoginOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {Link, useNavigate} from "react-router-dom";
import { callLogin } from "../../services/api.js";
import { doLoginAction } from "../../redux/account/accountSlice.js";
import CryptoJS from "crypto-js";
import GoogleLogin from "./GoogleLogin.jsx";
import {GoogleOAuthProvider} from "@react-oauth/google"; // Import thư viện crypto-js

const { Title } = Typography;

export default function SignIn() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { auth } = useSelector((state) => state);
  const [loading, setLoading] = useState(false);

  const secretKey = "my-super-secret-key-123456"; // 1 key cố định hoặc tạo key bảo mật hơn.

  // Hàm mã hóa mật khẩu
  const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, secretKey).toString();
  };

  // Hàm giải mã mật khẩu
  const decryptPassword = (encryptedPassword) => {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  useEffect(() => {
    // Kiểm tra xem có lưu username và password không
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser) {
      const { username, password } = JSON.parse(rememberedUser);
      form.setFieldsValue({ username, password: decryptPassword(password), remember: true });
    }
  }, [form]);

  const onFinish = async (values) => {
    const { username, password, remember } = values;
    setLoading(true);

    const res = await callLogin({ username, password });
    setLoading(false);

    if (res?.data?.user) {
      const userId = res.data.user.id; // Lấy userId từ phản hồi của API
      const userRole = res.data.user.role; // Lấy vai trò người dùng từ phản hồi API
      // Lưu userId vào localStorage
      localStorage.setItem("userId", userId);
      // Lưu vai trò vào localStorage
      localStorage.setItem("userRole", userRole.name);

      // Kiểm tra "Remember me" và lưu username + password mã hóa
      if (remember) {
        const encryptedPassword = encryptPassword(password); // Mã hóa mật khẩu trước khi lưu
        localStorage.setItem("rememberedUser", JSON.stringify({ username, password: encryptedPassword }));
      } else {
        localStorage.removeItem("rememberedUser");
      }

      localStorage.setItem("access_token", res.data.access_token);
      dispatch(doLoginAction(res.data.user));
      form.resetFields();
      message.success("Đăng nhập thành công");
      navigate("/");
    } else {
      notification.error({
        message: "Something went wrong!",
        description: res?.data?.message ? res.data.message : res.message,
        duration: 1,
      });
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
      <>
        <Form
            name="signin"
            form={form}
            initialValues={{
              remember: false,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
          <Title level={2} className="text-center">
            Sign in
          </Title>
          <Form.Item
              name="username"
              hasFeedback
              label="Email address"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[
                {
                  required: true,
                  message: "Please input your email.",
                },
                {
                  type: "email",
                  message: "Your email is invalid.",
                },
              ]}
          >
            <Input placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
              name="password"
              hasFeedback
              label="Password"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              rules={[
                {
                  required: true,
                  message: "Please input your password.",
                },
                { min: 5, message: "Password must be minimum 5 characters." },
              ]}
          >
            <Input.Password placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Link className="login-form-forgot" to="/forgot">
              Forgot password?
            </Link>
          </Form.Item>

          <Button
              loading={loading}
              type="primary"
              htmlType="submit"
              shape="round"
              icon={<LoginOutlined />}
              size="large"
          >
            Sign In
          </Button>

          <GoogleOAuthProvider clientId="824050494772-hq3tch1avqvtbff8chou58hvecpbt3qi.apps.googleusercontent.com">
            <GoogleLogin/>
          </GoogleOAuthProvider>

        </Form>
      </>
  );
}
