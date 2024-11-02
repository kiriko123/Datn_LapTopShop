import { Descriptions, Divider, Drawer } from "antd";
import moment from 'moment';

const VoucherViewDetail = ({ openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail }) => {

    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    };

    return (
        <Drawer
            title="Chi tiết Voucher"
            width="90%"
            onClose={onClose}
            open={openViewDetail}
            bodyStyle={{ padding: '0 16px' }}
        >
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="ID">{dataViewDetail?.id}</Descriptions.Item>
                <Descriptions.Item label="Mã Voucher">{dataViewDetail?.voucherCode}</Descriptions.Item>
                <Descriptions.Item label="Giá trị">{dataViewDetail?.voucherValue}</Descriptions.Item>
                <Descriptions.Item label="Ngày bắt đầu">
                    {moment(dataViewDetail?.startDate).format('DD-MM-YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày hết hạn">
                    {moment(dataViewDetail?.endDate).format('DD-MM-YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    {dataViewDetail?.active ? 'Đang áp dụng' : 'Ngừng hoạt động'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                    {moment(dataViewDetail?.createdAt).format('DD-MM-YYYY hh:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cập nhật">
                    {moment(dataViewDetail?.updatedAt).format('DD-MM-YYYY hh:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="Người tạo">
                    {dataViewDetail?.createdBy}
                </Descriptions.Item>
                <Descriptions.Item label="Người cập nhật">
                    {dataViewDetail?.updatedBy}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                    {dataViewDetail?.description}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
};

export default VoucherViewDetail;
