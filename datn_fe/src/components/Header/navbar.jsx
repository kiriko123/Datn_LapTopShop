import React, { useEffect, useState } from 'react';
import { Divider, Badge, Drawer, message, Button, Anchor, Avatar, Modal, Input, Popover } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import { useNavigate } from "react-router-dom";
import { callLogout } from "../../services/api.js";
import { doLogoutAction } from "../../redux/account/accountSlice.js";
import './navbar.css'
import { FaHome } from "react-icons/fa";
import { MdContactSupport } from "react-icons/md";
import { MdContactPhone } from "react-icons/md";
import { RiLoginCircleFill } from "react-icons/ri";
import { RiAdminFill } from "react-icons/ri";
import { FaUserEdit } from "react-icons/fa";
import { RiLogoutBoxFill } from "react-icons/ri";
import { FiShoppingCart } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import ManageAccount from "../Account/ManageAccount.jsx";
import { MdHistoryEdu } from "react-icons/md";
import Head from "./head.jsx";
import { FaBookQuran } from "react-icons/fa6";
import { GrProductHunt } from "react-icons/gr";

const Navbar = (props) => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const isAuthenticated = useSelector(state => state.account.isAuthenticated);
    const role = useSelector(state => state.account.user.role.name);
    const user = useSelector(state => state.account.user);
    const { t, i18n } = useTranslation();

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const carts = useSelector(state => state.order.carts);

    const [showManageAccount, setShowManageAccount] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [visible, setVisible] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleSearch = (value) => {
        if (value.trim()) {
            navigate('/product', { state: { searchTerm: value.trim() } });
        }
    };

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && res.statusCode === 200) {
            dispatch(doLogoutAction());
            message.success('Đăng xuất thành công');
            navigate('/auth');
        }
    };

    const items = [
        {
            label: <label style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    onClick={() => setShowManageAccount(true)}
                >
                    <FaUserEdit />
                    <span>Edit profile</span>
                </div>
            </label>,
            key: 'account',
        },
        // Conditionally show History for non-admin users
        ...(role !== 'ROLE_ADMIN' ? [{
            label: <label style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    onClick={() => navigate('/history')}
                >
                    <MdHistoryEdu />
                    <span>History</span>
                </div>
            </label>,
            key: 'history',
        }] : []),
        ...(role === 'ROLE_ADMIN' ? [{
            label: <label style={{ cursor: 'pointer' }}
                onClick={() => navigate('/admin')}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <RiAdminFill />
                    <span>Admin page</span>
                </div>
            </label>,
            key: 'admin',
        }] : []),
        {
            label: <label style={{ cursor: 'pointer' }}
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

    const showDrawer = () => {
        setVisible(true);
    };

    const onClose = () => {
        setVisible(false);
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 100);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${user?.imageUrl}`;

    const contentPopover = () => {
        return (
            <div className='pop-cart-body'>
                <div className='pop-cart-content'>
                    {carts?.map((book, index) => (
                        <div className='book' key={`book-${index}`}>
                            <img alt='' src={`${import.meta.env.VITE_BACKEND_URL}/storage/product/${book?.detail?.thumbnail}`} />
                            <div>{book?.detail?.name}</div>
                            <div className='price'>
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(book?.detail?.price ?? 0)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className='pop-cart-footer'>
                    <button onClick={() => navigate('/order')}>Xem giỏ hàng</button>
                </div>
            </div>
        )
    };

    return (
        <>
            <Head />
            <div className={`header ${isSticky ? "sticky" : ""}`}>
                <div className="container-fluid">
                    <div className="nav">
                        <div className="logo">
                            <i className="fas"> <FaBookQuran /> </i>
                            <a href="" onClick={() => navigate('/')}>Electronic Store</a>
                        </div>

                        <div className="search-bar">
                            <Input.Search
                                placeholder="Search "
                                enterButton
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onSearch={handleSearch}
                            />
                        </div>

                        <div className="mobileHidden">
                            <nav>
                                <div>
                                    <span onClick={() => navigate('/')}> <FaHome /> <p>{t('home')}</p></span>
                                </div>
                                <div>
                                    <span onClick={() => navigate('/product')}> <GrProductHunt /> <p>{t('product')}</p></span>
                                </div>
                                <div>
                                    <span onClick={() => navigate('/about')}> <MdContactSupport /> <p>{t('about')}</p></span>
                                </div>
                                <div>
                                    <span onClick={() => navigate('/contact')}> <MdContactPhone /> <p>{t('contact')}</p></span>
                                </div>

                                <div>
                                    {!isAuthenticated || user === null ?
                                        <span onClick={() => navigate('/auth')}><RiLoginCircleFill /> <p>{t('login_register')}</p></span>
                                        :
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '25px'
                                        }}>
                                            {/* Conditionally show cart icon for non-admin users */}
                                            {role !== 'ROLE_ADMIN' && (
                                                <Popover
                                                    className="popover-carts"
                                                    placement="topRight"
                                                    rootClassName="popover-carts"
                                                    title={"Sản phẩm mới thêm"}
                                                    content={contentPopover}
                                                    arrow={true}>
                                                    <Badge
                                                        count={carts?.length ?? 0}
                                                        size='default'
                                                        showZero
                                                        color={"#214167"}
                                                    >
                                                        <FiShoppingCart size={'23px'} className='icon-cart' />
                                                    </Badge>
                                                </Popover>
                                            )}
                                            <Dropdown menu={{ items }} trigger={['click']}>
                                                <Space style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <Avatar src={urlAvatar} />
                                                    <span>
                                                        <span> {user?.name} </span>
                                                        <DownOutlined />
                                                    </span>
                                                </Space>
                                            </Dropdown>
                                        </div>
                                    }
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            <ManageAccount
                isModalOpen={showManageAccount}
                setIsModalOpen={setShowManageAccount}
            />
        </>
    )
};

export default Navbar;
