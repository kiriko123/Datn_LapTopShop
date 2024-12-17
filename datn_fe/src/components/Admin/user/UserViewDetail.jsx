import { Avatar, Badge, Descriptions, Drawer, Modal, Grid } from "antd";
import moment from 'moment';
import { AntDesignOutlined } from "@ant-design/icons";
import { useState } from 'react';

const { useBreakpoint } = Grid;

const UserViewDetail = (props) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;

    // State để kiểm soát modal hiển thị ảnh lớn
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Ant Design's responsive grid system
    const screens = useBreakpoint();

    // Đóng Drawer và xóa dữ liệu
    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    }

    // Xử lý sự kiện khi người dùng click vào avatar
    const handleAvatarClick = () => {
        setIsModalOpen(true);
    };

    // Đóng modal hiển thị ảnh
    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    // Đường dẫn đến avatar
    const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${dataViewDetail?.imageUrl}`;

    return (
        <>
            <Drawer
                title="User Detail"
                width={screens.xs ? "100%" : screens.sm ? "80%" : screens.md ? "60%" : "40%"} // Responsive width
                onClose={onClose}
                open={openViewDetail}
                bodyStyle={{ paddingBottom: 80 }}
            >
                <Descriptions
                    bordered
                    column={screens.xs ? 1 : screens.sm ? 2 : 3}  // Responsive columns
                >
                    <Descriptions.Item label="Avatar" span={3}>
                        <Avatar
                            size={screens.xs ? 80 : 100}  // Responsive avatar size
                            icon={<AntDesignOutlined />}
                            src={urlAvatar}
                            shape="circle"
                            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)', margin: '0 auto', display: 'block', cursor: 'pointer' }}
                            onClick={handleAvatarClick} // Sự kiện click mở modal
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label="Id">{dataViewDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Email">{dataViewDetail?.email}</Descriptions.Item>
                    <Descriptions.Item label="Firstname">{dataViewDetail?.firstName}</Descriptions.Item>
                    <Descriptions.Item label="Lastname">{dataViewDetail?.name}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">{dataViewDetail?.phoneNumber}</Descriptions.Item>
                    <Descriptions.Item label="Address">{dataViewDetail?.address}</Descriptions.Item>
                    <Descriptions.Item label="Age">{dataViewDetail?.age}</Descriptions.Item>
                    <Descriptions.Item label="Gender">{dataViewDetail?.gender}</Descriptions.Item>
                    <Descriptions.Item label="Enabled">
                        {dataViewDetail?.enabled ? 'Enabled' : 'Disabled'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Role" span={2}>
                        <Badge status="processing" text={dataViewDetail?.role?.name} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At">
                        {moment(dataViewDetail?.createdAt).format('DD-MM-YYYY hh:mm:ss')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Updated At">
                        {moment(dataViewDetail?.updatedAt).format('DD-MM-YYYY hh:mm:ss')}
                    </Descriptions.Item>
                    <Descriptions.Item label="CreatedBy">
                        {dataViewDetail?.createdBy}
                    </Descriptions.Item>
                    <Descriptions.Item label="UpdatedBy">
                        {dataViewDetail?.updatedBy}
                    </Descriptions.Item>
                    <Descriptions.Item label="IsGoogleAcount">
                        {dataViewDetail?.googleAccount ? 'True' : 'False'}
                    </Descriptions.Item>
                </Descriptions>
            </Drawer>

            {/* Modal hiển thị ảnh lớn */}
            <Modal
                open={isModalOpen}
                onCancel={handleModalClose}
                footer={null}
            >
                <img
                    src={urlAvatar}
                    alt="Avatar"
                    style={{ width: '100%' }}
                />
            </Modal>
        </>
    );
}

export default UserViewDetail;
