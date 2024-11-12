import React, { useState } from 'react';
import {
    AppstoreOutlined,
    ExceptionOutlined,
    UserOutlined,
    DollarCircleOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DownOutlined,
    TagOutlined,
    BarChartOutlined,

} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, message, Avatar } from 'antd';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { callLogout } from "../../services/api.js";
import { doLogoutAction } from "../../redux/account/accountSlice.js";
import './layout.scss';
import { FaUserEdit } from "react-icons/fa";
import { RiLogoutBoxFill } from "react-icons/ri";
import { BiCategoryAlt } from "react-icons/bi";
import { FaHome } from "react-icons/fa";
import ManageAccount from "../Account/ManageAccount.jsx";
import { TfiLayoutSlider } from "react-icons/tfi";
import { TbBrandAirtable } from "react-icons/tb";
import { GrProductHunt } from "react-icons/gr";

const { Content, Sider } = Layout;

const items = [
    {
        label: <Link to='/admin'>Dashboard</Link>,
        key: 'dashboard',
        icon: <AppstoreOutlined />
    },
    {
        label: <Link to='/admin/user'>Users</Link>,
        key: 'user',
        icon: <UserOutlined />,
    },
    {

        label: <Link to='/admin/category'>Categories</Link>,
        key: 'category',
        icon: <BiCategoryAlt />
    },
    {
        label: <Link to='/admin/product'>Product</Link>,
        key: 'product',
        icon: <GrProductHunt />
    },
    {
        label: <Link to='/admin/slider'>Slider</Link>,
        key: 'slider',
        icon: <TfiLayoutSlider />

    },
    {
        label: <Link to='/admin/brand'>Brand</Link>,
        key: 'brand',
        icon: <TbBrandAirtable />
    },
    {
        label: <Link to='/admin/order'>Orders</Link>,
        key: 'order',
        icon: <DollarCircleOutlined />
    },
    {

        label: <Link to='/admin/voucher'>Vouchers</Link>,
        key: 'voucher',

        icon: <TagOutlined/>


    },
    {
        label: <Link to='/admin/statistics'>statistics</Link>,
        key: 'statistics',
        icon: <BarChartOutlined />
    }
];

const LayoutAdmin = () => {
    const [collapsed, setCollapsed] = useState(true);
    const user = useSelector(state => state.account.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showManageAccount, setShowManageAccount] = useState(false);
    const location = useLocation();

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && res.statusCode === 200) {
            dispatch(doLogoutAction());
            message.success('Đăng xuất thành công');
            navigate('/');
        }
    };

    // Xác định `key` từ đường dẫn hiện tại
    const getKeyFromPathname = () => {
        const path = location.pathname;
        if (path.includes('/admin/user')) return 'user';
        if (path.includes('/admin/product')) return 'product';
        if (path.includes('/admin/order')) return 'order';
        if (path.includes('/admin/category')) return 'category';
        if (path.includes('/admin/slider')) return 'slider';
        if (path.includes('/admin/brand')) return 'brand';
        if (path.includes('/admin/voucher')) return 'voucher';
        if (path.includes('/admin/statistics')) return 'statistics';
        return 'dashboard';
    };

    const itemsDropdown = [
        {
            label: <label style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    onClick={() => setShowManageAccount(true)}>
                    <FaUserEdit />
                    <span>Edit profile</span>
                </div>
            </label>,
            key: 'account',
        },
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/')}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaHome />
                    <span>Home page</span>
                </div>
            </label>,
            key: 'homepage',
        },
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <RiLogoutBoxFill />
                    <span>Logout</span>
                </div>
            </label>,
            key: 'logout',
        },
    ];

    const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${user?.imageUrl}`;

    return (
        <Layout
            style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }} // Nền sáng nhẹ cho toàn bộ trang
            className="layout-admin"
        >
            <Sider
                theme='dark'
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                style={{
                    backgroundColor: '#0f3460', // Sidebar màu xám tối
                    position: 'sticky', // Giữ menu cố định khi cuộn
                    top: 0, // Giữ menu từ phía trên của viewport
                    zIndex: 1000, // Đảm bảo nó nằm trên các thành phần khác khi cuộn
                    height: '100vh' // Đặt chiều cao bằng chiều cao viewport
                }}
            >
                <div style={{ height: 32, margin: 16, textAlign: 'center', color: '#fff', fontSize: 16 }}>
                    Admin
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[getKeyFromPathname()]} // Chọn đúng menu item dựa vào đường dẫn hiện tại
                    items={items}
                    style={{ backgroundColor: '#0f3460' }} // Màu nền sidebar menu đồng nhất
                />
            </Sider>

            <Layout>
                <div className='admin-header' style={{ backgroundColor: '#0f3460', color: '#fff', padding: '0 16px' }}>
                    <span>
                        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            className: 'trigger',
                            style: { color: '#fff' }, // Icon màu trắng cho dễ nhìn
                            onClick: () => setCollapsed(!collapsed),
                        })}
                    </span>
                    <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                        <a onClick={(e) => e.preventDefault()} style={{ color: '#fff' }}>
                            <Space style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Avatar src={urlAvatar} />
                                <span>
                                    <span>Welcome back: {user?.name} </span>
                                    <DownOutlined />
                                </span>
                            </Space>
                        </a>
                    </Dropdown>
                </div>
                <Content
                    style={{
                        margin: '10px 10px',
                        padding: 10,
                        minHeight: 280,
                        backgroundColor: '#fff', // Vùng content nền trắng sáng
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
            <ManageAccount
                isModalOpen={showManageAccount}
                setIsModalOpen={setShowManageAccount}
            />
        </Layout>
    );
};

export default LayoutAdmin;
