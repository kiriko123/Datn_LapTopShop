import React, { useEffect, useState } from 'react';
import {Col, Divider, Form, Input, InputNumber, message, Modal, notification, Radio, Row, Select, Upload} from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import {callCreateProduct, callFetchBrand, callFetchCategory, callUploadFile} from "../../../services/api.js";
import TextArea from "antd/es/input/TextArea.js";

const ProductModalCreate = (props) => {
    const { openModalCreate, setOpenModalCreate } = props;
    const [isSubmit, setIsSubmit] = useState(false);

    const [listCategory, setListCategory] = useState([]);
    const [listBrand, setListBrand] = useState([]);
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [loadingSlider, setLoadingSlider] = useState(false);

    const [imageUrl, setImageUrl] = useState("");
    const [dataThumbnail, setDataThumbnail] = useState([]);
    const [dataSlider, setDataSlider] = useState([]);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    useEffect(() => {
        fetchCategory();
        fetchBrand();
    }, []);

    const fetchCategory = async () => {
        const res = await callFetchCategory();
        if (res && res.data) {
            const d = res.data
                .filter(item => item.active)
                .map(item => ({ label: item.name, value: item.id }));
            setListCategory(d);
            console.log(listCategory);
        }
    };
    const fetchBrand = async () => {
        const res = await callFetchBrand();
        if (res && res.data) {
            const d = res.data
                .filter(item => item.active)
                .map(item => ({ label: item.name, value: item.id }));
            setListBrand(d);
        }
    };

    const onFinish = async (values) => {
        if (dataThumbnail.length === 0) {
            notification.error({ message: 'Lỗi validate', description: 'Vui lòng upload ảnh thumbnail' });
            return;
        }

        if (dataSlider.length === 0) {
            notification.error({ message: 'Lỗi validate', description: 'Vui lòng upload ảnh slider' });
            return;
        }

        const { name, author, price, quantity, sold, categoryId, discount, description, sale, hot, brandId } = values;
        const thumbnail = dataThumbnail[0].name;
        const sliders = dataSlider.map(item => item.name);
        const images = sliders;
        setIsSubmit(true);
        const res =
            await callCreateProduct({ name, price, discount, thumbnail, quantity, sold, description, sale, hot, images,  categoryId, brandId });
        if (res && res.data) {
            message.success('Tạo mới product thành công');
            form.resetFields();
            setDataSlider([]);
            setDataThumbnail([]);
            setOpenModalCreate(false);
            await props.fetchProduct();
        } else {
            notification.error({ message: 'Đã có lỗi xảy ra', description: res.message });
        }
        setIsSubmit(false);
    };

    const getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG/WEBP file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    const handleChange = (info, type) => {
        if (info.file.status === 'uploading') {
            type ? setLoadingSlider(true) : setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            getBase64(info.file.originFileObj, (url) => {
                type ? setLoadingSlider(false) : setLoading(false);
                setImageUrl(url);
            });
        }
    };

    const handleUploadFileThumbnail = async ({ file, onSuccess, onError }) => {
        const res = await callUploadFile(file, 'product');
        if (res && res.data) {
            setDataThumbnail([{ name: res.data.fileName, uid: file.uid }]);
            onSuccess('ok');
        } else {
            onError('Đã có lỗi khi upload file');
        }
    };

    const handleUploadFileSlider = async ({ file, onSuccess, onError }) => {
        const res = await callUploadFile(file, 'product');
        if (res && res.data) {
            setDataSlider((prevDataSlider) => [...prevDataSlider, { name: res.data.fileName, uid: file.uid }]);
            onSuccess('ok');
        } else {
            onError('Đã có lỗi khi upload file');
        }
    };

    const handleRemoveFile = (file, type) => {
        if (type === 'thumbnail') {
            setDataThumbnail([]);
        }
        if (type === 'slider') {
            const newSlider = dataSlider.filter(x => x.uid !== file.uid);
            setDataSlider(newSlider);
        }
    };

    const handlePreview = async (file) => {
        getBase64(file.originFileObj, (url) => {
            setPreviewImage(url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
        });
    };

    return (
        <>
            <Modal
                title="Thêm mới product"
                open={openModalCreate}
                onOk={() => form.submit()}
                onCancel={() => {
                    form.resetFields();
                    setOpenModalCreate(false);
                }}
                okText={"Tạo mới"}
                cancelText={"Hủy"}
                confirmLoading={isSubmit}
                width="80vw" // Adjust the modal width to be responsive
                centered
                maskClosable={false}
            >
                <Divider />

                <Form form={form} name="basic" onFinish={onFinish} autoComplete="off">
                    <Row gutter={15}>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Brand" name="brandId" rules={[{ required: true, message: 'Vui lòng chọn thể loại!' }]}>
                                <Select showSearch allowClear options={listBrand} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Giá tiền" name="price" rules={[{ required: true, message: 'Vui lòng nhập giá tiền!' }]}>
                                <InputNumber min={0} style={{ width: '100%' }} addonAfter="VND" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Thể loại" name="categoryId" rules={[{ required: true, message: 'Vui lòng chọn category!' }]}>
                                <Select showSearch allowClear options={listCategory} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Số lượng" name="quantity" rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}>
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Discount" name="discount" rules={[{ required: true, message: 'Vui lòng nhập discount!' }]} initialValue={0}>
                                <InputNumber min={1} style={{ width: '100%' }} defaultValue={0} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Đã bán" name="sold" rules={[{ required: true, message: 'Vui lòng nhập số lượng đã bán!' }]} initialValue={0}>
                                <InputNumber min={0} defaultValue={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item
                                label="Hot"
                                name="hot"
                                rules={[{ required: true, message: 'Vui lòng chọn!' }]}
                            >
                                <Radio.Group>
                                    <Radio value={true}>True</Radio>
                                    <Radio value={false}>False</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item
                                label="Sale"
                                name="sale"
                                rules={[{ required: true, message: 'Vui lòng chọn!' }]}
                            >
                                <Radio.Group>
                                    <Radio value={true}>True</Radio>
                                    <Radio value={false}>False</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24}>
                            <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Vui lòng nhập description!' }]}>
                                <TextArea rows={4} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Ảnh Thumbnail" name="thumbnail">
                                <Upload
                                    name="thumbnail"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    maxCount={1}
                                    multiple={false}
                                    customRequest={handleUploadFileThumbnail}
                                    beforeUpload={beforeUpload}
                                    onChange={handleChange}
                                    onRemove={(file) => handleRemoveFile(file, "thumbnail")}
                                    onPreview={handlePreview}
                                >
                                    <div>
                                        {loading ? <LoadingOutlined /> : <PlusOutlined />}
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Ảnh Slider" name="slider">
                                <Upload
                                    name="slider"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    multiple
                                    customRequest={handleUploadFileSlider}
                                    beforeUpload={beforeUpload}
                                    onChange={handleChange}
                                    onRemove={(file) => handleRemoveFile(file, "slider")}
                                    onPreview={handlePreview}
                                >
                                    <div>
                                        {loadingSlider ? <LoadingOutlined /> : <PlusOutlined />}
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
                    <img alt="preview" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </Modal>
        </>
    );
};

export default ProductModalCreate;
