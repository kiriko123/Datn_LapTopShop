import React, {useEffect, useState} from 'react';
import {Col, Divider, Form, Input, InputNumber, message, Modal, notification, Radio, Row, Select, Upload} from 'antd';
import {callFetchBrand, callFetchCategory, callUpdateProduct, callUploadFile} from '../../../services/api';
import {LoadingOutlined, PlusOutlined} from '@ant-design/icons'
import {v4 as uuidv4} from 'uuid';
import TextArea from "antd/es/input/TextArea.js";

const ProductModalUpdate = (props) => {
    const {openModalUpdate, setOpenModalUpdate, dataUpdate, setDataUpdate} = props;
    const [isSubmit, setIsSubmit] = useState(false);

    const [listCategory, setListCategory] = useState([]);
    const [listBrand, setListBrand] = useState([]);
    const [form] = Form.useForm();


    const [loading, setLoading] = useState(false);
    const [loadingSlider, setLoadingSlider] = useState(false);

    const [imageUrl, setImageUrl] = useState("");

    const [dataThumbnail, setDataThumbnail] = useState([])
    const [dataSlider, setDataSlider] = useState([])

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const [initForm, setInitForm] = useState(null);

    useEffect(() => {
        const fetchCategory = async () => {
            const res = await callFetchCategory();
            if (res && res.data) {
                console.log(res.data);
                const d = res.data.map(item => {
                    return {label: item.name, value: item.id};
                })
                setListCategory(d);
            }
        }
        const fetchBrand = async () => {
            const res = await callFetchBrand();
            if (res && res.data) {
                const d = res.data
                    .filter(item => item.active)
                    .map(item => ({label: item.name, value: item.id}));
                setListBrand(d);
            }
        };
        fetchBrand();
        fetchCategory();
    }, [])

    useEffect(() => {
        if (dataUpdate?.id) {
            const arrThumbnail = [
                {
                    uid: uuidv4(),
                    name: dataUpdate.thumbnail,
                    status: 'done',
                    url: `${import.meta.env.VITE_BACKEND_URL}/storage/product/${dataUpdate.thumbnail}`,
                }
            ]

            const arrSlider = dataUpdate?.images?.map(item => {
                return {
                    uid: uuidv4(),
                    name: item,
                    status: 'done',
                    url: `${import.meta.env.VITE_BACKEND_URL}/storage/product/${item}`,
                }
            })

            const init = {
                id: dataUpdate.id,
                name: dataUpdate.name,
                author: dataUpdate.author,
                price: dataUpdate.price,
                active: dataUpdate.active,
                category: dataUpdate.category.id,
                brand: dataUpdate.brand.id,
                hot: dataUpdate.hot,
                sale: dataUpdate.sale,
                description: dataUpdate.description,
                discount: dataUpdate.discount,
                quantity: dataUpdate.quantity,
                sold: dataUpdate.sold,
                thumbnail: {fileList: arrThumbnail},
                sliders: {fileList: arrSlider}
            }
            setInitForm(init);
            setDataThumbnail(arrThumbnail);
            setDataSlider(arrSlider);
            form.setFieldsValue(init);
        }
        return () => {
            form.resetFields();
        }
    }, [dataUpdate])


    const onFinish = async (values) => {
        if (dataThumbnail.length === 0) {
            notification.error({
                message: 'Lỗi validate',
                description: 'Vui lòng upload ảnh thumbnail'
            })
            return;
        }

        if (dataSlider.length === 0) {
            notification.error({
                message: 'Lỗi validate',
                description: 'Vui lòng upload ảnh slider'
            })
            return;
        }

        // const {id, name, author, price, soldQuantity, quantity, category, active} = values;
        const {id, name, author, price, quantity, sold, category, discount, description, sale, hot, brand, active } = values;
        console.log(">>>>Check category", category);
        console.log(">>>>Check brand", brand);
        const categoryId = category;
        const brandId = brand;
        const thumbnail = dataThumbnail[0].name;
        const sliders = dataSlider.map(item => item.name);
        const images = sliders;
        setIsSubmit(true)
        const res = await callUpdateProduct({
            id,
            name,
            price,
            discount,
            thumbnail,
            quantity,
            sold,
            description,
            sale,
            hot,
            images,
            categoryId,
            brandId,
            active
        });
        if (res && res.data) {
            message.success('Cập nhật product thành công');
            form.resetFields();
            setDataSlider([]);
            setDataThumbnail([]);
            setInitForm(null);
            setOpenModalUpdate(false);
            await props.fetchProduct()
        } else {
            notification.error({
                message: 'Đã có lỗi xảy ra',
                description: res.message
            })
        }
        setIsSubmit(false)
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
            // Get this url from response in real world.
            getBase64(info.file.originFileObj, (url) => {
                type ? setLoadingSlider(false) : setLoading(false);
                setImageUrl(url);
            });
        }
    };


    const handleUploadFileThumbnail = async ({file, onSuccess, onError}) => {
        const res = await callUploadFile(file, 'product');
        if (res && res.data) {
            setDataThumbnail([{
                name: res.data.fileName,
                uid: file.uid
            }])
            onSuccess('ok')
        } else {
            onError('Đã có lỗi khi upload file');
        }
    };

    const handleUploadFileSlider = async ({file, onSuccess, onError}) => {
        const res = await callUploadFile(file, 'product');
        if (res && res.data) {
            //copy previous state => upload multiple images
            setDataSlider((dataSlider) => [...dataSlider, {
                name: res.data.fileName,
                uid: file.uid
            }])
            onSuccess('ok')
        } else {
            onError('Đã có lỗi khi upload file');
        }
    };

    const handleRemoveFile = (file, type) => {
        if (type === 'thumbnail') {
            setDataThumbnail([])
        }
        if (type === 'sliders') {
            const newSlider = dataSlider.filter(x => x.uid !== file.uid);
            setDataSlider(newSlider);
        }
    }

    const handlePreview = async (file) => {
        if (file.url && !file.originFileObj) {
            setPreviewImage(file.url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
            return;
        }
        getBase64(file.originFileObj, (url) => {
            setPreviewImage(url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
        });
    };


    return (
        <>
            <Modal
                title="Cập nhật product"
                open={openModalUpdate}
                onOk={() => {
                    form.submit()
                }}
                onCancel={() => {
                    form.resetFields();
                    setInitForm(null)
                    setDataUpdate(null);
                    setOpenModalUpdate(false)
                }}
                okText={"Cập nhật"}
                cancelText={"Hủy"}
                confirmLoading={isSubmit}
                width={"80vw"}
                //do not close when click outside
                maskClosable={false}
                centered
            >
                <Divider/>

                <Form
                    form={form}
                    name="basic"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Row gutter={15}>
                        <Col hidden>
                            <Form.Item
                                hidden
                                labelCol={{span: 24}}
                                label="Id"
                                name="id"
                            >
                                <Input/>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item label="Tên sản phẩm" name="name"
                                       rules={[{required: true, message: 'Vui lòng nhập tên hiển thị!'}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Thương hiệu" name="brand"
                                       rules={[{required: true, message: 'Vui lòng chọn thể loại!'}]}>
                                <Select showSearch allowClear options={listBrand}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Giá tiền" name="price"
                                       rules={[{required: true, message: 'Vui lòng nhập giá tiền!'}]}>
                                <InputNumber min={0} style={{width: '100%'}} addonAfter="VND"/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Thể loại" name="category"
                                       rules={[{required: true, message: 'Vui lòng chọn category!'}]}>
                                <Select showSearch allowClear options={listCategory}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Số lượng" name="quantity"
                                       rules={[{required: true, message: 'Vui lòng nhập số lượng!'}]}>
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Giảm giá" name="discount"
                                       rules={[{required: true, message: 'Vui lòng nhập discount!'}]} initialValue={0}>
                                <InputNumber min={0} style={{width: '100%'}} defaultValue={0}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Đã bán" name="sold"
                                       rules={[{required: true, message: 'Vui lòng nhập số lượng đã bán!'}]}
                                       initialValue={0}>
                                <InputNumber min={0} defaultValue={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item
                                label="Hot"
                                name="hot"
                                rules={[{required: true, message: 'Vui lòng chọn!'}]}
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
                                rules={[{required: true, message: 'Vui lòng chọn!'}]}
                            >
                                <Radio.Group>
                                    <Radio value={true}>True</Radio>
                                    <Radio value={false}>False</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item
                                label="Active"
                                name="active"
                                rules={[{required: true, message: 'Vui lòng chọn!'}]}
                            >
                                <Radio.Group>
                                    <Radio value={true}>True</Radio>
                                    <Radio value={false}>False</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24}>
                            <Form.Item label="Mô tả" name="description"
                                       rules={[{required: true, message: 'Vui lòng nhập description!'}]}>
                                <TextArea rows={4}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                labelCol={{span: 24}}
                                label="Ảnh Thumbnail"
                                name="thumbnail"
                            >
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
                                    defaultFileList={initForm?.thumbnail?.fileList ?? []}
                                >
                                    <div>
                                        {loading ? <LoadingOutlined/> : <PlusOutlined/>}
                                        <div style={{marginTop: 8}}>Upload</div>
                                    </div>
                                </Upload>
                            </Form.Item>

                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                labelCol={{span: 24}}
                                label="Ảnh Slider"
                                name="sliders"
                            >
                                <Upload
                                    multiple
                                    name="sliders"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    customRequest={handleUploadFileSlider}
                                    beforeUpload={beforeUpload}
                                    onChange={(info) => handleChange(info, 'sliders')}
                                    onRemove={(file) => handleRemoveFile(file, "sliders")}
                                    onPreview={handlePreview}
                                    defaultFileList={initForm?.sliders?.fileList ?? []}
                                >
                                    <div>
                                        {loadingSlider ? <LoadingOutlined/> : <PlusOutlined/>}
                                        <div style={{marginTop: 8}}>Upload</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

            </Modal>
            <Modal centered open={previewOpen} title={previewTitle} footer={null}
                   onCancel={() => setPreviewOpen(false)}>
                <img alt="example" style={{width: '100%'}} src={previewImage}/>
            </Modal>
        </>
    );
};

export default ProductModalUpdate;