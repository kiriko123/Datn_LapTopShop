import { Col, Divider, Empty, InputNumber, message, Row, Select } from 'antd';
import { DeleteTwoTone } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { doDeleteItemCartAction, doUpdateCartAction,setVoucherAction } from '../../redux/order/orderSlice';
import {callFetchBrand, callFetchCategory,callFetchProduct, callApiGet } from '../../services/api.js';

const { Option } = Select;

const ViewOrder = (props) => {
    const carts = useSelector(state => state.order.carts);
    const [totalPrice, setTotalPrice] = useState(0);
    const dispatch = useDispatch();
    const user = useSelector(state => state.account.user);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [userVouchers, setUserVouchers] = useState([]);

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
            }
        };
        fetchVouchers();
    }, [user]);


    useEffect(() => {
        if (carts && carts.length > 0) {
            let sum = 0;
            carts.forEach((item) => {
                const discount = item.detail.discount ?? 0;
                const priceAfterDiscount = item.detail.price - (item.detail.price * discount / 100);
                sum += item.quantity * priceAfterDiscount;
            });

            // Áp dụng voucher (nếu có)
            if (selectedVoucher) {
                const discountValue = (selectedVoucher.voucher.voucherValue / 100) * sum;
                sum -= discountValue;
            }

            setTotalPrice(sum);
        } else {
            setTotalPrice(0);
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

        let activeProducts = [];
        try {
            const response = await callFetchProduct("active=true");
            console.log('Dữ liệu trả về từ API:', response);
            activeProducts = response.data.result; // Lấy dữ liệu từ API
            // if (!Array.isArray(activeProducts)) {
            //     throw new Error("Dữ liệu trả về không phải là một mảng!");
            // }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sản phẩm:', error);
            message.error('Không thể kiểm tra trạng thái sản phẩm. Vui lòng thử lại sau!');
            return;
        }
        // Chuyển danh sách sản phẩm thành một đối tượng để dễ kiểm tra
        const activeProductMap = {};
        activeProducts.forEach(product => {
            activeProductMap[product.id] = product.active; // Đánh dấu sản phẩm có active=true
        });

        // Lấy danh sách thương hiệu từ API
        let brands = [];
        try {
            const response = await callFetchBrand();
            brands = response.data; // Giả sử dữ liệu trả về là một mảng thương hiệu
        } catch (error) {
            console.error('Lỗi khi lấy danh sách thương hiệu:', error);
            message.error('Không thể kiểm tra thương hiệu. Vui lòng thử lại sau!');
            return; // Dừng hàm nếu không lấy được thương hiệu
        }

        // Chuyển đổi danh sách thương hiệu thành một đối tượng để dễ dàng kiểm tra
        const brandMap = {};
        brands.forEach(brand => {
            brandMap[brand.id] = brand.active; // Giả sử thương hiệu có thuộc tính id và active
        });

        // Lấy danh sách danh mục từ API
        let categories = [];
        try {
            const response = await callFetchCategory();
            categories = response.data; // Giả sử dữ liệu trả về là một mảng danh mục
        } catch (error) {
            console.error('Lỗi khi lấy danh sách danh mục:', error);
            message.error('Không thể kiểm tra danh mục. Vui lòng thử lại sau!');
            return; // Dừng hàm nếu không lấy được danh mục
        }

        // Chuyển đổi danh sách danh mục thành một đối tượng để dễ dàng kiểm tra
        const categoryMap = {};
        categories.forEach(category => {
            categoryMap[category.id] = category.active; // Giả sử danh mục có thuộc tính id và active
        });

        // Tạo một đối tượng để lưu thông báo cho từng sản phẩm
        let messages = {};

        // Kiểm tra từng sản phẩm trong giỏ hàng
        carts.forEach(cartItem => {
            const productName = cartItem.detail.name;
            const brandId = cartItem.detail.brand?.id; // Lấy ID thương hiệu
            const categoryId = cartItem.detail.category?.id; // Lấy ID danh mục
            const productId = cartItem.detail.id;

            const isBrandActive = brandId ? brandMap[brandId] : false; // Kiểm tra hoạt động dựa trên brandMap
            const isCategoryActive = categoryId ? categoryMap[categoryId] : false; // Kiểm tra hoạt động dựa trên categoryMap
            const isProductActive = productId ? activeProductMap[productId] : false;

            if (!isBrandActive || !isCategoryActive || !isProductActive) {
                // Nếu sản phẩm không hoạt động, thêm tên sản phẩm vào messages
                messages[productName] = true; // Chỉ cần lưu tên sản phẩm là đủ
            }
        });

        // Kiểm tra nếu có thông báo
        if (Object.keys(messages).length > 0) {
            const productNames = Object.keys(messages).join(', ');
            const inactiveMessage = `${productNames} Đã hết hàng. Vui lòng xóa sản phẩm để tiếp tục mua hàng.`;
            message.error(inactiveMessage);
            return;
        }


        props.setCurrentStep(1);
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
                            onChange={handleVoucherSelect}
                            style={{width: "100%"}}
                        >
                            <Option value="none">Không sử dụng voucher</Option>
                            {userVouchers.map((voucher) => (
                                <Option key={voucher.id} value={voucher.id}>
                                    {voucher.voucher.voucherCode} - Giảm {voucher.voucher.voucherValue}%
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div className='calculate'>
                        <span>Tạm tính</span>
                        <span>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice || 0)}
                        </span>
                    </div>
                    <Divider style={{ margin: "10px 0" }} />
                    <div className='calculate'>
                        <span>Tổng tiền</span>
                        <span className='sum-final'>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice || 0)}
                        </span>
                    </div>
                    <Divider style={{ margin: "10px 0" }} />
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