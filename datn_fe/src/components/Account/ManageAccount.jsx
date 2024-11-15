import {Drawer, Tabs} from "antd";
import UserInfo from "./UserInfo";
import ChangePassword from "./ChangePassword";
import { useSelector } from "react-redux";
import {useEffect, useState} from "react";  // Thêm file CSS để tùy chỉnh giao diện

const ManageAccount = (props) => {
    const { isModalOpen, setIsModalOpen } = props;
    const user = useSelector(state => state.account.user);

    const [drawerWidth, setDrawerWidth] = useState("60vw");

    // Adjust the drawer width based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setDrawerWidth("90vw");  // 90vw for smaller screens
            } else {
                setDrawerWidth("62vw");  // Default 60vw for larger screens
            }
        };

        // Add event listener on window resize
        window.addEventListener("resize", handleResize);

        // Call the function initially to set the correct width
        handleResize();

        // Cleanup event listener on component unmount
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const items = [
        {
            key: 'info',
            label: `Cập nhật thông tin`,
            children: <UserInfo />,
        },
    ];

    if (!user.googleAccount) {
        items.push({
            key: 'password',
            label: `Đổi mật khẩu`,
            children: <ChangePassword />,
        });
    }

    return (
        <Drawer
            title="Quản lý tài khoản"
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            width={drawerWidth}
            bodyStyle={{ padding: '0px 10px 0px 10px' }}
            className="manage-account-modal"
        >
            <Tabs
                defaultActiveKey="info"
                items={items}
                size="large"
            />
        </Drawer>
    );
};

export default ManageAccount;
