import React, {useEffect, useState} from 'react';
import {Divider, Badge, Drawer, message, Button, Anchor, Avatar, Modal, Popover} from 'antd';
import {useDispatch, useSelector} from 'react-redux';
import {DownOutlined} from '@ant-design/icons';
import {Dropdown, Space} from 'antd';
import {Link, useNavigate} from "react-router-dom";
import {callLogout} from "../../services/api.js";
import {doLogoutAction} from "../../redux/account/accountSlice.js";
import './navbar.css'
import {FaHome} from "react-icons/fa";
import {BiSolidCategoryAlt} from "react-icons/bi";
import {FaCartShopping} from "react-icons/fa6";
import {MdContactSupport} from "react-icons/md";
import {FaUserCircle} from "react-icons/fa";
import {RiLoginCircleFill} from "react-icons/ri";
import {RiAdminFill} from "react-icons/ri";
import {FaUserEdit} from "react-icons/fa";
import {RiLogoutBoxFill} from "react-icons/ri";
import {FiShoppingCart} from "react-icons/fi";
import {useTranslation} from "react-i18next";
import ManageAccount from "../Account/ManageAccount.jsx";


const Navbar = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const isAuthenticated = useSelector(state => state.account.isAuthenticated);
    const role = useSelector(state => state.account.user.role.name);
    console.log("check menu", role);
    const user = useSelector(state => state.account.user);
    const {t, i18n} = useTranslation();
    console.log(user);
    const navigate = useNavigate();

    const dispatch = useDispatch();
    const [showManageAccount, setShowManageAccount] = useState(false);

    const handleLogout = async () => {
        const res = await callLogout();
        console.log('logout res: ', res);
        if (res && res.statusCode === 200) {
            dispatch(doLogoutAction());
            message.success('Đăng xuất thành công');
            navigate('/auth');
        }
    }

    const items = [
        {
            label: <label style={{cursor: 'pointer'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}
                     onClick={() => setShowManageAccount(true)}
                >
                    <FaUserEdit/>
                    <span>Edit profile</span>
                </div>
            </label>,
            key: 'account',
        },
        ...(role === 'ROLE_ADMIN' ? [{
            label: <label
                style={{cursor: 'pointer'}}
                onClick={() => navigate('/admin')}
            >
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <RiAdminFill/>
                    <span>Admin page</span>
                </div>
            </label>,
            key: 'admin',
        }] : []),
        {
            label: <label
                style={{cursor: 'pointer'}}
                onClick={() => handleLogout()}
            >
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <RiLogoutBoxFill/>
                    <span>Logout</span>
                </div>
            </label>,
            key: 'logout',
        },
    ];

    const [visible, setVisible] = useState(false);

    const showDrawer = () => {
        setVisible(true);
    };

    const onClose = () => {
        setVisible(false);
    };
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 100); // Adjust the number as needed
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${user?.imageUrl}`;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const contentPopover = () => {
        return (
            <div className='pop-cart-body'>
                <div className='pop-cart-content'>
                    testaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                    {/*{carts?.map((book, index) => {*/}
                    {/*    return (*/}
                    {/*        <div className='book' key={`book-${index}`}>*/}
                    {/*            <img alt=''*/}
                    {/*                 src={`${import.meta.env.VITE_BACKEND_URL}/storage/book/${book?.detail?.thumbnail}`}/>*/}
                    {/*            <div>{book?.detail?.name}</div>*/}
                    {/*            <div className='price'>*/}
                    {/*                {new Intl.NumberFormat('vi-VN', {*/}
                    {/*                    style: 'currency',*/}
                    {/*                    currency: 'VND'*/}
                    {/*                }).format(book?.detail?.price ?? 0)}*/}
                    {/*            </div>*/}
                    {/*        </div>*/}
                    {/*    )*/}
                    {/*})}*/}
                </div>
                <div className='pop-cart-footer'>
                    <button onClick={() => navigate('/order')}>Xem giỏ hàng</button>
                </div>
            </div>
        )}

    return (
        <div className={`header ${isSticky ? "sticky" : ""}`}>
            <div className="container-fluid">
                <div className="nav">
                    <div className="logo">
                        <i className="fas fa-bolt"></i>
                        <a href="http://google.com">好不好</a>
                    </div>
                    <div className="mobileHidden">
                        <nav>
                            <div>
                                <span onClick={() => navigate('/')}> <FaHome/> <p>{t('home')}</p></span>
                            </div>
                            <div>
                                <span onClick={() => navigate('/1')}> <BiSolidCategoryAlt/> <p>{t('product')}</p></span>
                            </div>
                            <div>
                                <span onClick={() => navigate('/3')}> <MdContactSupport/> <p>{t('about')}</p></span>
                            </div>

                            <div>
                                {!isAuthenticated || user === null ?
                                    <span
                                        onClick={() => navigate('/auth')}><RiLoginCircleFill/> <p>{t('login_register')}</p></span>
                                    :
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '25px'
                                    }}>
                                        <div>
                                            <Popover
                                                className="popover-carts"
                                                placement="topRight"
                                                rootClassName="popover-carts"
                                                title={"Sản phẩm mới thêm"}
                                                content={contentPopover}
                                                arrow={true}>
                                                <Badge
                                                    // count={carts?.length ?? 0}
                                                    size='default'
                                                    count="8"
                                                    showZero
                                                >
                                                    <FiShoppingCart size={'23px'} className='icon-cart'/>
                                                </Badge>
                                            </Popover>

                                        </div>
                                        <Dropdown menu={{items}} trigger={['click']}>
                                            <Space style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                <Avatar src={urlAvatar}/>
                                                <span>
                                                <span> {user?.name} </span>
                                                <DownOutlined/>
                                            </span>
                                            </Space>
                                        </Dropdown>
                                    </div>
                                }
                            </div>
                        </nav>
                    </div>
                    <div className="mobileVisible">
                        <Button type="primary" onClick={showDrawer}>
                            <i className="fas fa-bars"></i>
                        </Button>
                        <Drawer
                            placement="right"
                            closable={true}
                            onClose={onClose}
                            visible={visible}
                        >
                            <nav className="mobileVisible-nav">
                                <div className="mobileVisible-nav-div" onClick={() => navigate('/')}>
                                    <span><FaHome/> {t('home')}</span>
                                </div>
                                <div className="mobileVisible-nav-div" onClick={() => navigate('/1')}>
                                    <span> <BiSolidCategoryAlt/> {t('product')}</span>
                                </div>
                                <div className="mobileVisible-nav-div" onClick={() => navigate('/3')}>
                                    <span> <MdContactSupport/> {t('about')}</span>
                                </div>
                                <div>
                                    {!isAuthenticated || user === null ? (
                                        <div className="mobileVisible-nav-div" onClick={() => navigate('/auth')}>
                                            <span><RiLoginCircleFill/>Login/Register</span>
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '10px',

                                        }}>
                                            <Dropdown menu={{items}} trigger={['click']}>
                                                <Space style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                    <Avatar src={urlAvatar}/>
                                                    <span>
                                                <span> {user?.name} </span>
                                                <DownOutlined/>
                                            </span>
                                                </Space>
                                            </Dropdown>

                                            <div>
                                                <Badge
                                                    // count={carts?.length ?? 0}
                                                    size={"small"}
                                                    count="8"
                                                    showZero
                                                >
                                                    <FiShoppingCart className='icon-cart' size={'23px'}/>
                                                </Badge>
                                            </div>
                                        </div>
                                    )}

                                    <Modal title="User Menu" visible={isModalVisible} onCancel={handleCancel}
                                           footer={null}>
                                        {items.map((item) => (
                                            <div key={item.key} style={{padding: '10px 0'}}>
                                                {item.label}
                                            </div>
                                        ))}
                                    </Modal>
                                </div>
                            </nav>
                        </Drawer>
                    </div>

                </div>
            </div>
            <ManageAccount
                isModalOpen={showManageAccount}
                setIsModalOpen={setShowManageAccount}
            />
        </div>
    )
};

export default Navbar;
