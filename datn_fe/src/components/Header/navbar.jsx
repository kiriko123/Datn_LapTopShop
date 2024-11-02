import React, { useEffect, useState } from 'react';
import { Divider, Badge, Drawer, message, Button, Anchor, Avatar, Modal, Input, Popover } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import { useNavigate } from "react-router-dom";
import { callLogout, callFetchProduct } from "../../services/api.js";
import { doLogoutAction } from "../../redux/account/accountSlice.js";
import './navbar.css'
import { FaHome } from "react-icons/fa";
import { MdContactSupport } from "react-icons/md";
import { MdContactPhone  } from "react-icons/md";
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
import { SearchBar } from './SearchBar';
import { SearchResultsList } from './SearchResultsList';


const Navbar = (props) => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const isAuthenticated = useSelector(state => state.account.isAuthenticated);
    const role = useSelector(state => state.account.user.role.name);
    console.log("check menu", role);
    const user = useSelector(state => state.account.user);
    const { t, i18n } = useTranslation();
    console.log(user);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const carts = useSelector(state => state.order.carts);

    const [showManageAccount, setShowManageAccount] = useState(false);
    const [results, setResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const handleSearch = (value) => {
        setResults([]);
        if(value.trim()){
            navigate('/product', { state: { searchTerm: value.trim() } });
        }else {
            // Nếu không có từ khóa, gọi API lấy toàn bộ sản phẩm
            navigate('/product', { state: { searchTerm: "" } });
        }

    };

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
        {
            label: <label style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    onClick={() => navigate('/history')}
                >
                    <MdHistoryEdu />
                    <span>History</span>
                </div>
            </label>,
            key: 'history',
        },
        ...(role === 'ROLE_ADMIN' ? [{
            label: <label
                style={{ cursor: 'pointer' }}
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
                    {carts?.map((book, index) => {
                        return (
                            <div className='book' key={`book-${index}`}>
                                <img alt=''
                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/product/${book?.detail?.thumbnail}`} />
                                <div>{book?.detail?.name}</div>
                                <div className='price'>
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(book?.detail?.price ?? 0)}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className='pop-cart-footer'>
                    <button onClick={() => navigate('/order')}>Xem giỏ hàng</button>
                </div>
            </div>
        )
    }


    return (
        <>
            <Head />
            <div className={`header ${isSticky ? "sticky" : ""}`}>
                <div className="container-fluid">
                    <div className="nav">
                        <div className="logo">
                            <i className="fas"> <FaBookQuran/> </i>
                            <a href="" onClick={() => navigate('/')}>Laptop Store</a>
                        </div>

                        {/*<div className="search-bar">*/}
                        {/*    <Input.Search*/}
                        {/*        placeholder="Search "*/}
                        {/*        enterButton*/}
                        {/*        value={searchTerm}*/}
                        {/*        onChange={(e) => setSearchTerm(e.target.value)}*/}
                        {/*        onSearch={handleSearch}*/}
                        {/*    />*/}
                        {/*</div>*/}
                        <div className="search-bar">
                            <SearchBar
                                setResults={setResults}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                handleSearch={handleSearch}/>
                            {results.length > 0 && (
                                <SearchResultsList
                                    results={results}
                                    setResults={setResults}
                                    setSearchTerm={setSearchTerm}/>
                            )}
                        </div>


                        <div className="mobileHidden">
                            <nav>
                                <div>
                                    <span onClick={() => navigate('/')}> <FaHome/> <p>{t('home')}</p></span>
                                </div>
                                <div>
                                    <span
                                        onClick={() => navigate('/product')}> <GrProductHunt/> <p>{t('product')}</p></span>
                                </div>
                                <div>
                                    <span
                                        onClick={() => navigate('/about')}> <MdContactSupport/> <p>{t('about')}</p></span>
                                </div>
                                <div>
                                    <span onClick={() => navigate('/contact')}> <MdContactPhone/> <p>{t('contact')}</p></span>
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
                                                        count={carts?.length ?? 0}
                                                        size='default'
                                                        showZero
                                                        color={"#214167"}
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
                                {isAuthenticated && user && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between', // Align cart icon to the right
                                        alignItems: 'center',
                                        paddingBottom: '10px',
                                    }}>
                                        <Space style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                            <Avatar src={urlAvatar}/>
                                            <span>
                                                <span> {user?.name} </span>
                                            </span>
                                        </Space>
                                        <Badge
                                            count={carts?.length ?? 0}
                                            size={"small"}
                                            showZero
                                        >
                                            <FiShoppingCart onClick={() => navigate('/order')} className='icon-cart'
                                                            size={'23px'}/>
                                        </Badge>
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    marginTop: '10px'
                                }}
                                     onClick={() => navigate('/')}>
                                    <FaHome/>
                                    <p>{t('home')}</p>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    marginTop: '10px'
                                }}
                                     onClick={() => navigate('/product')}>
                                    <FaHome/>
                                    <p>Product</p>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    margin: '10px 0 10px 0',
                                    cursor: 'pointer'
                                }}
                                     onClick={() => navigate('/about')}>
                                    <MdContactSupport/>
                                    <p>{t('about')}</p>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    margin: '10px 0 10px 0',
                                    cursor: 'pointer'
                                }}
                                     onClick={() => navigate('/contact')}>
                                    <MdContactPhone/>
                                    <p>{t('contact')}</p>
                                </div>

                                {!isAuthenticated || user === null ?
                                    <nav className="mobileVisible-nav">
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            cursor: 'pointer'
                                        }}
                                             onClick={() => navigate('/auth')}>
                                            <RiLoginCircleFill/>
                                            <p>{t('login_register')}</p>
                                        </div>
                                    </nav>

                                    : <></>}

                                {isAuthenticated && user && (
                                    <nav className="mobileVisible-nav">
                                        {items.map(item => (
                                            <div key={item.key}>
                                                {item.label}
                                            </div>
                                        ))}
                                    </nav>
                                )}
                            </Drawer>
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
