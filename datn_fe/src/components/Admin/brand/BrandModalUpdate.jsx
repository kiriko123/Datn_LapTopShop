import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Upload, message, Row, Col, Divider, notification, Radio } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { callUpdateBrand, callUploadFile } from '../../../services/api';
import { v4 as uuidv4 } from 'uuid';

const BrandModalUpdate = ({ open, setOpen, dataUpdate, setDataUpdate, fetchBrands }) => {
    const [form] = Form.useForm();
    const [isSubmit, setIsSubmit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dataThumbnail, setDataThumbnail] = useState([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [initForm, setInitForm] = useState(null);

    useEffect(() => {
        if (dataUpdate?.id) {
            const arrThumbnail = dataUpdate.thumbnail ? [{
                uid: uuidv4(),
                name: dataUpdate.thumbnail,
                status: 'done',
                url: `${import.meta.env.VITE_BACKEND_URL}/storage/brand/${dataUpdate.thumbnail}`,
            }] : [];

            const init = {
                id: dataUpdate.id,
                name: dataUpdate.name,
                description: dataUpdate.description,
                thumbnail: arrThumbnail,
                active: dataUpdate.active // Thêm dòng này để thiết lập giá trị active
            };
            setInitForm(init);
            setDataThumbnail(arrThumbnail);
            form.setFieldsValue(init); // Thiết lập giá trị cho form
        }
        return () => {
            form.resetFields();
        }
    }, [dataUpdate, form]);

    const handleUpdate = async (values) => {
        if (dataThumbnail.length === 0) {
            notification.error({
                message: 'Lỗi validate',
                description: 'Vui lòng upload ảnh thumbnail'
            });
            return;
        }

        const { id, name, description, active } = values;
        const thumbnail = dataThumbnail[0].name;

        setIsSubmit(true);
        try {
            const res = await callUpdateBrand({ id, name, description, thumbnail, active });
            if (res && res.data) {
                message.success('Cập nhật thương hiệu thành công');
                form.resetFields();
                setDataThumbnail([]);
                setInitForm(null);
                setOpen(false);
                await fetchBrands();
            } else {
                throw new Error(res.message || 'Không thể cập nhật thương hiệu');
            }
        } catch (error) {
            notification.error({
                message: 'Đã có lỗi xảy ra',
                description: error.message
            });
        } finally {
            setIsSubmit(false);
        }
    };

    const handleUploadFileThumbnail = async ({ file, onSuccess, onError }) => {
        setLoading(true);
        try {
            const res = await callUploadFile(file, 'brand');
            if (res && res.data) {
                setDataThumbnail([{
                    name: res.data.fileName,
                    uid: file.uid
                }]);
                onSuccess('ok');
            } else {
                throw new Error('Không thể upload file');
            }
        } catch (error) {
            onError('Đã có lỗi khi upload file');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFile = (file) => {
        setDataThumbnail([]);
    };

    const getBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Hình ảnh phải nhỏ hơn 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    return (
        <>
            <Modal
                title="Cập nhật thương hiệu"
                open={open}
                onOk={() => form.submit()}
                onCancel={() => {
                    setOpen(false);
                    setDataUpdate(null);
                    form.resetFields();
                    setInitForm(null);
                }}
                okText="Cập nhật"
                cancelText="Hủy"
                confirmLoading={isSubmit}
                width="50vw"
                centered
                maskClosable={false}
            >
                <Divider />
                <Form form={form} onFinish={handleUpdate} layout="vertical">
                    <Row gutter={15}>
                        <Col span={24}>
                            <Form.Item
                                name="id"
                                hidden
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="name"
                                label="Tên thương hiệu"
                                rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="description"
                                label="Mô tả"
                                rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                            >
                                <Input.TextArea rows={4} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="thumbnail"
                                label="Ảnh Thumbnail"
                                valuePropName="fileList"
                                getValueFromEvent={(e) => {
                                    if (Array.isArray(e)) {
                                        return e;
                                    }
                                    return e && e.fileList;
                                }}
                            >
                                <Upload
                                    name="thumbnail"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    maxCount={1}
                                    multiple={false}
                                    customRequest={handleUploadFileThumbnail}
                                    beforeUpload={beforeUpload}
                                    onRemove={handleRemoveFile}
                                    onPreview={handlePreview}
                                >
                                    <div>
                                        {loading ? <LoadingOutlined /> : <PlusOutlined />}
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="Active"
                                name="active"
                                rules={[{ required: true, message: 'Vui lòng chọn!' }]}
                            >
                                <Radio.Group>
                                    <Radio value={true}>Active</Radio>
                                    <Radio value={false}>Disable</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
            <Modal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewOpen(false)}
            >
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};

export default BrandModalUpdate;
