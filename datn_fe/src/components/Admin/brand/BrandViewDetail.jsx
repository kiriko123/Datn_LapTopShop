import { Avatar, Badge, Descriptions, Divider, Drawer, Modal, Upload } from "antd";
import moment from 'moment';
import { AntDesignOutlined } from "@ant-design/icons";
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const BrandViewDetail = (props) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;

    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    }

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        if (dataViewDetail) {
            let imgThumbnail = {};
            if (dataViewDetail.thumbnail) {
                imgThumbnail = {
                    uid: uuidv4(),
                    name: dataViewDetail.thumbnail,
                    status: 'done',
                    url: `${import.meta.env.VITE_BACKEND_URL}/storage/brand/${dataViewDetail.thumbnail}`,
                }
            }
            setFileList([imgThumbnail])
        }
    }, [dataViewDetail])

    const handleCancel = () => setPreviewOpen(false);

    const handlePreview = async (file) => {
        setPreviewImage(file.url);
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const handleChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    }

    return (
        <>
            <Drawer
                title="Chi tiết thương hiệu"
                width={"60vw"}
                onClose={onClose}
                open={openViewDetail}
            >
                <Descriptions
                    bordered
                    column={2}
                >
                    <Descriptions.Item label="Id">{dataViewDetail?.id}</Descriptions.Item>
                    <Descriptions.Item label="Tên thương hiệu">{dataViewDetail?.name}</Descriptions.Item>
                    <Descriptions.Item label="Mô tả" span={2}>{dataViewDetail?.description}</Descriptions.Item>
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
                </Descriptions>
                <Divider orientation="left" > Ảnh thương hiệu </Divider>

                <Upload
                    action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    showUploadList={
                        { showRemoveIcon: false }
                    }
                >
                </Upload>
                <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel} centered>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </Drawer>
        </>
    );
}

export default BrandViewDetail;
