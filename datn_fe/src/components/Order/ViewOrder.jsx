import {Col, Divider, Empty, InputNumber, message, notification, Row, Select} from 'antd';
import { DeleteTwoTone } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { doDeleteItemCartAction, doUpdateCartAction,setVoucherAction } from '../../redux/order/orderSlice';
import {
    callFetchBrand,
    callFetchCategory,
    callFetchProduct,
    callApiGet,
    callFetchAllProduct
} from '../../services/api.js';

const { Option } = Select;

const ViewOrder = (props) => {
    const carts = useSelector(state => state.order.carts);
    const [totalPrice, setTotalPrice] = useState(0);
    const dispatch = useDispatch();
    const user = useSelector(state => state.account.user);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [userVouchers, setUserVouchers] = useState([]);
    const [totalPriceNoVoucher, setTotalPriceNoVouhcer] = useState(0);
    const [discountVoucher, setDiscountVoucher] = useState(0);
    const fetchUserVouchers = async (userId) => {
        try {
            const response = await callApiGet(userId);
            return response.data; // Trả về danh sách voucher
        } catch (error) {
            console.error("Error fetching user vouchers:", error);
            return [];
        }
    };

    // Xử lý khi người dùng chọn voucher
    const handleVoucherSelect = (voucherId) => {
        const voucher = userVouchers.find(v => v.id === voucherId);
        if (!voucher) return;

        if (totalPriceNoVoucher < voucher.voucher.priceApply) {
            message.error(`Tổng giá trị đơn hàng phải lớn hơn ${new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(voucher.voucher.priceApply)} để áp dụng voucher này.`);
            return;
        }

        setSelectedVoucher(voucher);  // Cập nhật voucher được chọn vào local state
        dispatch(setVoucherAction(voucher));  // Dispatch action lưu voucher vào Redux store
    };

    // Khi người dùng chọn "Không sử dụng voucher"
    const handleNoVoucher = () => {
        setSelectedVoucher(null);  // Reset local state
        dispatch(setVoucherAction(null));  // Dispatch action để reset voucher trong Redux
    };

    useEffect(() => {
        // Reset voucher khi quay lại trang
        setSelectedVoucher(null);  // Reset voucher trong local state
        dispatch(setVoucherAction(null));  // Reset voucher trong Redux store
    }, []);

    useEffect(() => {
        const fetchVouchers = async () => {
            if (user?.id) {
                const vouchers = await fetchUserVouchers(user.id);
                setUserVouchers(vouchers);

                // Lọc các voucher đủ điều kiện
                const validVouchers = vouchers.filter(voucher =>
                    totalPriceNoVoucher >= voucher.voucher.priceApply
                );

                // Tìm voucher có giá trị giảm giá lớn nhất
                if (validVouchers.length > 0) {
                    const bestVoucher = validVouchers.reduce((prev, current) =>
                        prev.voucher.voucherValue > current.voucher.voucherValue ? prev : current
                    );

                    // Chọn voucher tốt nhất
                    setSelectedVoucher(bestVoucher);
                    dispatch(setVoucherAction(bestVoucher));
                }
            }
        };
        fetchVouchers();
    }, [user, totalPriceNoVoucher]);


    useEffect(() => {
        if (carts && carts.length > 0) {
            let sum = 0;
            carts.forEach((item) => {
                const discount = item.detail.discount ?? 0;
                const priceAfterDiscount = item.detail.price - (item.detail.price * discount / 100);
                sum += item.quantity * priceAfterDiscount;
            });
            setTotalPriceNoVouhcer(sum);
            // Kiểm tra nếu voucher không còn hợp lệ
            if (selectedVoucher && sum < selectedVoucher.voucher.priceApply) {
                // Reset voucher
                setSelectedVoucher(null);
                dispatch(setVoucherAction(null));
                message.error("Tổng giá trị đơn hàng không còn đủ để áp dụng voucher hiện tại. Voucher đã được chọn lại.");
            }

            // Áp dụng voucher (nếu còn hợp lệ)
            if (selectedVoucher && sum >= selectedVoucher.voucher.priceApply) {
                const discountValue = (selectedVoucher.voucher.voucherValue / 100) * sum;
                sum -= discountValue;
                setDiscountVoucher(discountValue);
            } else {
                setDiscountVoucher(0);
            }
            setTotalPrice(sum);
        } else {
            // Reset khi không có sản phẩm trong giỏ hàng
            setTotalPrice(0);
            setDiscountVoucher(0);
            setSelectedVoucher(null);
            dispatch(setVoucherAction(null));
        }
    }, [carts, selectedVoucher]);

    const handleOnChangeInput = (value, book) => {
        if (!value || value < 1) return;
        if (!isNaN(value)) {
            dispatch(doUpdateCartAction({ quantity: value, detail: book, _id: book._id }))
        }
    };

    const handlePurchase = async () => {
        if (user?.role?.id === 1) {
            message.info("Not support for admin");
            return;
        }
        if (carts.length === 0) {
            message.error('Oops, không có gì hết nè!!!');
            return; // Thêm return để dừng xử lý tiếp theo
        }

        const result = await validateCart(carts);

        if (!result.success) {
            console.log("Giỏ hàng không hợp lệ:", result.errors);

            notification.error({
                message: 'Lỗi',
                description: result.errors.map((error, index) => (
                    <>
                        {error}
                        {index < result.errors.length - 1 && <br />}
                    </>
                )),
            });

            return;
        }


        props.setCurrentStep(1);
    };

    const validateCart = async (carts) => {
        let products = [];
        try {
            // Call API lấy tất cả sản phẩm từ backend
            let data = await callFetchAllProduct(); // Giả sử hàm này call API thành công
            products = data.data;
            // Danh sách lỗi nếu có sản phẩm không hợp lệ
            let errors = [];

            // Lặp qua từng sản phẩm trong giỏ hàng
            carts.forEach((cartItem) => {
                const productInBE = products.find((p) => p.id === cartItem.detail.id);

                // Kiểm tra sản phẩm có tồn tại trong BE không
                if (!productInBE) {
                    errors.push(`Sản phẩm "${cartItem.detail.name}" không còn tồn tại.`);
                    return;
                }

                // Kiểm tra trạng thái sản phẩm
                if (!productInBE.active) {
                    errors.push(`Sản phẩm "${cartItem.detail.name}" đã bị xóa.`);
                    return;
                }

                // Kiểm tra brand và category
                if (!productInBE.brand?.active || !productInBE.category?.active) {
                    errors.push(`Thương hiệu hoặc danh mục của sản phẩm "${cartItem.detail.name}" đã bị xóa. Vui lòng xóa sản phẩm ra khỏi giỏ hàng`);
                    return;
                }

                // Kiểm tra số lượng sản phẩm
                if (cartItem.quantity > productInBE.quantity) {
                    errors.push(
                        `Sản phẩm "${cartItem.detail.name}" không đủ số lượng. Chỉ còn ${productInBE.quantity} sản phẩm.`
                    );
                    return;
                }

                // Kiểm tra giá và discount
                if (
                    cartItem.detail.price !== productInBE.price ||
                    cartItem.detail.discount !== productInBE.discount
                ) {
                    errors.push(
                        `Sản phẩm "${cartItem.detail.name}" có giá hoặc giảm giá không khớp với hệ thống. Vui lòng xóa và thêm lại`
                    );
                    return;
                }

            });

            // Trả về kết quả
            if (errors.length > 0) {
                return { success: false, errors };
            }

            return { success: true, message: "Giỏ hàng hợp lệ." };
        } catch (error) {
            console.error("Lỗi khi validate giỏ hàng:", error);
            return { success: false, errors: ["Lỗi hệ thống khi kiểm tra giỏ hàng."] };
        }
    };



    return (
        <Row gutter={[20, 20]}>
            <Col md={18} xs={24}>
                {carts?.map((book, index) => {
                    const currentBookPrice = book?.detail?.price ?? 0;
                    const discount = book?.detail?.discount ?? 0; // Lấy discount từ chi tiết sách
                    const priceAfterDiscount = currentBookPrice - (currentBookPrice * discount / 100); // Giá sau giảm giá
                    return (
                        <div className='order-book' key={`index-${index}`}>
                            <div className='book-content'>
                                <img src={`${import.meta.env.VITE_BACKEND_URL}/storage/product/${book?.detail?.thumbnail}`} />
                                <div className='text-emerald-600 text-lg'>
                                    {book?.detail?.name}
                                </div>
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
                                <div className='quantity'>
                                    <InputNumber onChange={(value) => handleOnChangeInput(value, book)} value={book.quantity} />
                                </div>
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
                {carts.length === 0 &&
                    <div className='order-book-empty'>
                        <Empty
                            description={"Không có sản phẩm trong giỏ hàng"}
                        />
                    </div>
                }
            </Col>
            <Col md={6} xs={24}>
                <div className='order-sum'>
                    <div className="voucher-section">
                        <h3>Chọn Voucher</h3>
                        <Select
                            value={selectedVoucher ? selectedVoucher.id : "none"}
                            // onChange={handleVoucherSelect}
                            onChange={(value) => {
                                if (value === "none") {
                                    handleNoVoucher();
                                } else {
                                    handleVoucherSelect(value);
                                }
                            }}
                            style={{ width: "100%" }}
                        >
                            <Option value="none">Không sử dụng voucher</Option>
                            {userVouchers.map((voucher) => {
                                const isDisabled = totalPriceNoVoucher < voucher.voucher.priceApply;
                                return (
                                    <Option
                                        key={voucher.id}
                                        value={voucher.id}
                                        disabled={isDisabled} // Làm mờ voucher không đủ điều kiện
                                    >
                                        Giảm {voucher.voucher.voucherValue}% (Áp dụng từ {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(voucher.voucher.priceApply)})
                                    </Option>
                                );
                            })}
                        </Select>
                    </div>
                    <div className='calculate'>
                        <span>Tạm tính</span>
                        <span>
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(totalPriceNoVoucher || 0)}
                        </span>
                    </div>
                    <Divider style={{margin: "10px 0"}}/>
                    <div className='calculate'>
                        <span>Voucher giảm:</span>
                        <span>
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(discountVoucher || 0)}
                        </span>
                    </div>
                    <Divider style={{margin: "10px 0"}}/>
                    <div className='calculate'>
                        <span>Tổng tiền</span>
                        <span className='sum-final'>
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(totalPrice || 0)}
                        </span>
                    </div>
                    <Divider style={{margin: "10px 0"}}/>
                    <button
                        onClick={() => handlePurchase()}
                    >
                        Mua Hàng ({carts?.length ?? 0})
                    </button>
                </div>
            </Col>
        </Row>
    );
};

export default ViewOrder;