import { Avatar, Badge, Descriptions, Drawer, Modal, Grid, Image } from "antd";
import { AntDesignOutlined } from "@ant-design/icons";
import React, { useState } from 'react';
import moment from "moment";
const { useBreakpoint } = Grid;

const StatisticViewDetail = ({ openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail }) => {
    const screens = useBreakpoint();

    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    };
    

    return (
        <Drawer
            title="Chi tiết đơn hàng"
            placement="right"
            width={'70%'}
            onClose={onClose}
            open={openViewDetail}
        >
            {dataViewDetail && (
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="Tên người nhận">
                        {dataViewDetail.receiverName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                        {dataViewDetail.receiverPhone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">
                        {dataViewDetail.receiverAddress}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dataViewDetail.totalPrice)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        {dataViewDetail.status}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {moment(dataViewDetail.createdAt).format("DD-MM-YYYY hh:mm:ss")}
                    </Descriptions.Item>
                    
                </Descriptions>
            )}
        </Drawer>
    );
};

export default StatisticViewDetail;
