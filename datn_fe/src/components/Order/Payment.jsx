import { Col, Divider, Form, Radio, Row, message, notification } from 'antd';
import { DeleteTwoTone, LoadingOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { doDeleteItemCartAction, doPlaceOrderAction,setVoucherAction } from '../../redux/order/orderSlice';
import { Input } from 'antd';
import { AiOutlineRollback } from "react-icons/ai";
import CheckoutModal from './CheckoutModal';
import LocationSelect from "./LocationSelect.jsx";
import {callPlaceOrder} from "../../services/api.js";
const { TextArea } = Input;
import axios from 'axios'; // Import axios để gọi API

const Payment = (props) => {
    const carts = useSelector(state => state.order.carts);
    const selectedVoucher = useSelector(state => state.order.selectedVoucher); // Lấy voucher từ Redux
    const [totalPrice, setTotalPrice] = useState(0);
    const dispatch = useDispatch();
    const [isSubmit, setIsSubmit] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);
    const user = useSelector(state => state.account.user);
    const [form] = Form.useForm();
    const [fullAddress, setFullAddress] = useState('');

    // Address parts for validation
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    const [street, setStreet] = useState("");

    useEffect(() => {
        let sum = 0;
        // Tính tổng tiền trước khi áp dụng voucher
        carts.forEach(item => {
            const currentBookPrice = item?.detail?.price ?? 0;
            const discount = item?.detail?.discount ?? 0;
            const priceAfterDiscount = currentBookPrice - (currentBookPrice * discount / 100);
            sum += item.quantity * priceAfterDiscount;
        });

        // Áp dụng voucher (nếu có)
        if (selectedVoucher) {
            const discountValue = (selectedVoucher.voucher.voucherValue / 100) * sum;
            sum -= discountValue;
        }

        setTotalPrice(sum);
    }, [carts, selectedVoucher]); // Lắng nghe sự thay đổi của carts và selectedVoucher

    const handlePaymentChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handlePlaceOrder = async (paymentIntent = null) => {
        setIsSubmit(true);

        const detailOrder = carts.map(item => ({
            productName: item.detail.name,
            quantity: item.quantity,
            productId: item._id,
            price: item.detail.price,
            discount: item.detail.discount,
        }));

        console.log(detailOrder);

        //
        const data = {
            receiverName: form.getFieldValue('name'),
            receiverAddress: fullAddress,
            receiverPhone: form.getFieldValue('phone'),
            totalPrice: totalPrice,
            userId: user.id,
            status: 'PENDING',
            paymentMethod: paymentMethod,
            orderDetails: detailOrder,
            paymentIntentId: paymentIntent?.id ?? null,
            // Thêm thông tin voucher vào data gửi đi
            voucherCode: selectedVoucher ? selectedVoucher.voucher.voucherCode : null,
            voucherValue: selectedVoucher ? selectedVoucher.voucher.voucherValue : 0,
        };
        console.log("data",data);

        // Gọi API để đặt hàng
        const res = await callPlaceOrder(data);
        console.log('res:', res);
        
        if (res && res.data) {
            message.success('Đặt hàng thành công!');
            // Gọi API để áp dụng voucher nếu có
            if (selectedVoucher) {
                const voucherId = selectedVoucher.voucher.id;
                const applyVoucherRes = await axios.post(`http://localhost:8080/api/v1/user-voucher/${data.userId}/apply/${voucherId}`);

                if (applyVoucherRes.data.statusCode === 200) {
                    console.log('Voucher applied successfully!');
                } else {
                    console.log('Error applying voucher:', applyVoucherRes.data.message);
                }
            }

            dispatch(doPlaceOrderAction()); // Xóa giỏ hàng sau khi đặt hàng thành công
            props.setCurrentStep(2);
        } else {
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: res.message || 'Không có thông điệp lỗi từ server',
            });
        }

        setIsSubmit(false);
    };

    const onFinish = (values) => {
        if (!selectedProvince || !selectedDistrict || !selectedWard || !street) {
            notification.error({
                message: 'Địa chỉ không đầy đủ!',
                description: 'Vui lòng chọn đầy đủ tỉnh, huyện, xã và nhập số nhà, tên đường.',
            });
            return; // Prevent form submission if address is incomplete
        }

        if (paymentMethod === 'Thanh toán khi nhận hàng') {
            handlePlaceOrder();
        } else if (paymentMethod === 'Thanh toán bằng Stripe') {
            setIsCheckoutModalVisible(true);
        }
    };

    const handleAddressChange = (provinceName, districtName, wardName, street) => {
        setSelectedProvince(provinceName);
        setSelectedDistrict(districtName);
        setSelectedWard(wardName);
        setStreet(street);

        let address = `${street ? street + ', ' : ''}${wardName ? wardName + ', ' : ''}${districtName ? districtName + ', ' : ''}${provinceName}`;
        setFullAddress(address.trim().replace(/,\s*$/, ''));
    };



    return (
        <Row gutter={[20, 20]}>
            <Col md={16} xs={24}>
                {carts?.map((book, index) => {
                    const currentBookPrice = book?.detail?.price ?? 0;
                    const discount = book?.detail?.discount ?? 0;
                    const priceAfterDiscount = currentBookPrice - (currentBookPrice * discount / 100);
                    return (
                        <div className='order-book' key={`index-${index}`}>
                            <div className='book-content'>
                                <img src={`${import.meta.env.VITE_BACKEND_URL}/storage/product/${book?.detail?.thumbnail}`} />
                                <div className='text-emerald-00 text-lg'>{book?.detail?.name}</div>
                                <div className='price'>
                                    Giá gốc: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentBookPrice)}
                                    {discount > 0 && (
                                        <div className='discount'>
                                            Giảm giá: {discount}%
                                        </div>
                                    )}
                                    <div className='price-after-discount'>
                                        Giá sau giảm: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceAfterDiscount)}
                                    </div>
                                </div>
                            </div>
                            <div className='action'>
                                <div className='quantity'>Số lượng: {book?.quantity}</div>
                                <div className='sum'>
                                    Tổng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceAfterDiscount * (book?.quantity ?? 0))}
                                </div>
                                <DeleteTwoTone
                                    style={{ cursor: "pointer" }}
                                    onClick={() => dispatch(doDeleteItemCartAction({ _id: book._id }))}
                                    twoToneColor="#eb2f96"
                                />
                            </div>
                        </div>
                    );
                })}
            </Col>
            <Col md={8} xs={24}>
                <div className='order-sum'>
                    <div style={{ display: 'flex', justifyContent: 'end' }}>
                        <AiOutlineRollback onClick={() => props.setCurrentStep(0)} size={'30px'} style={{ cursor: 'pointer' }} />
                    </div>
                    <Form onFinish={onFinish} form={form}>
                        <Form.Item
                            style={{ margin: 0 }}
                            labelCol={{ span: 24 }}
                            label="Tên người nhận"
                            name="name"
                            initialValue={user?.name}
                            rules={[{ required: true, message: 'Tên người nhận không được để trống!' }]} >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            style={{ margin: 0 }}
                            labelCol={{ span: 24 }}
                            label="Số điện thoại"
                            name="phone"
                            initialValue={user?.phoneNumber}
                            rules={[{ required: true, message: 'Số điện thoại không được để trống!' }]} >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            style={{ margin: 0 }}
                            labelCol={{ span: 24 }}
                            label="Địa chỉ"
                            rules={[{ required: true, message: 'Vui lòng chọn địa chỉ!' }]} >
                            <LocationSelect onAddressChange={handleAddressChange} />
                        </Form.Item>

                        <div className='method'>
                            <div>Hình thức thanh toán</div>
                            <Radio.Group onChange={handlePaymentChange} value={paymentMethod}>
                                <Radio value="Thanh toán khi nhận hàng">Thanh toán khi nhận hàng</Radio>
                                <Radio value="Thanh toán bằng Stripe">Thanh toán bằng Stripe</Radio>
                            </Radio.Group>
                        </div>
                    </Form>

                    <Divider style={{ margin: "5px 0" }} />
                    <div className='calculate'>
                        <span>Tổng tiền</span>
                        <span className='sum-final'>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice || 0)}
                        </span>
                    </div>
                    <Divider style={{ margin: "5px 0" }} />
                    <button onClick={() => form.submit()} disabled={isSubmit || carts.length === 0}>
                        {isSubmit && <span><LoadingOutlined /> &nbsp;</span>}
                        Đặt Hàng ({carts?.length ?? 0})
                    </button>
                </div>
            </Col>

            <CheckoutModal
                isModalVisible={isCheckoutModalVisible}
                setIsModalVisible={setIsCheckoutModalVisible}
                onPaymentSuccess={handlePlaceOrder}
                amount={totalPrice}
            />
        </Row>
    );
};

export default Payment;
