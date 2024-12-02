import { Avatar, Badge, Descriptions, Divider, Drawer, Modal, Upload } from "antd";
import moment from 'moment';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const BookViewDetail = (props) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;

    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    };

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        if (dataViewDetail) {
            let imgThumbnail = {}, imgSlider = [];
            if (dataViewDetail.thumbnail) {
                imgThumbnail = {
                    uid: uuidv4(),
                    name: dataViewDetail.thumbnail,
                    status: 'done',
                    url: `${import.meta.env.VITE_BACKEND_URL}/storage/product/${dataViewDetail.thumbnail}`,
                };
            }
            if (dataViewDetail.images && dataViewDetail.images.length > 0) {
                dataViewDetail.images.map(item => {
                    imgSlider.push({
                        uid: uuidv4(),
                        name: item,
                        status: 'done',
                        url: `${import.meta.env.VITE_BACKEND_URL}/storage/product/${item}`,
                    });
                });
            }
            setFileList([imgThumbnail, ...imgSlider]);
        }
    }, [dataViewDetail]);

    const handleCancel = () => setPreviewOpen(false);

    const handlePreview = async (file) => {
        setPreviewImage(file.url);
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const handleChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    return (
        <>
            <Drawer
                title="Book Detail"
                width="90%"
                // style={{ maxWidth: '600px' }} // Giới hạn chiều rộng tối đa của Drawer
                onClose={onClose}
                open={openViewDetail}
                bodyStyle={{ padding: '0 16px' }} // Padding cho body của Drawer
            >
                <Descriptions
                    bordered
                    column={{ xs: 1, sm: 2 }} // Responsive cột
                >
                    <Descriptions.Item label="Id">{dataViewDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Tên sản phẩm">{dataViewDetail?.name}</Descriptions.Item>
                    <Descriptions.Item label="Thương hiệu">{dataViewDetail?.brand?.name}</Descriptions.Item>
                    <Descriptions.Item label="Giá">{dataViewDetail?.price}</Descriptions.Item>
                    <Descriptions.Item label="Số lượng">{dataViewDetail?.quantity}</Descriptions.Item>
                    <Descriptions.Item label="Đã bán">{dataViewDetail?.sold}</Descriptions.Item>
                    <Descriptions.Item label="Giảm giá">{dataViewDetail?.discount}</Descriptions.Item>
                    <Descriptions.Item label="Sale">
                        {dataViewDetail?.sale ? 'Sale' : 'Not sale'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Hot">
                        {dataViewDetail?.hot ? 'Hot' : 'Not hot'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Active">
                        {dataViewDetail?.active ? 'Active' : 'Inactive'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Danh mục" span={2}>
                        <Badge status="processing" text={dataViewDetail?.category?.name} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {moment(dataViewDetail?.createdAt).format('DD-MM-YYYY hh:mm:ss')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày cập nhật">
                        {moment(dataViewDetail?.updatedAt).format('DD-MM-YYYY hh:mm:ss')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tạo bởi">
                        {dataViewDetail?.createdBy}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cập nhật bởi">
                        {dataViewDetail?.updatedBy}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả">
                        {dataViewDetail?.description}
                    </Descriptions.Item>
                </Descriptions>
                <Divider orientation="left">Hình ảnh sản phẩm</Divider>

                <Upload
                    action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    showUploadList={{ showRemoveIcon: false }}
                >
                    {/* Upload Button (thêm biểu tượng tải lên) */}
                </Upload>
                <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel} centered>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </Drawer>
        </>
    );
};

export default BookViewDetail;
