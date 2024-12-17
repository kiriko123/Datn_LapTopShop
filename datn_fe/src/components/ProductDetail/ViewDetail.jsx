import {Row, Col, Rate, Divider, Button, message} from 'antd';
import './book.scss';
import ImageGallery from 'react-image-gallery';
import { useRef, useState,} from 'react';
import ModalGallery from './ModalGallery';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { BsCartPlus } from 'react-icons/bs';
import BookLoader from './BookLoader';
import {useDispatch, useSelector} from "react-redux";
import './Description.css'
import { doAddBookAction } from "../../redux/order/orderSlice.js";

const ViewDetail = (props) => {
    const { dataProduct } = props;
    const [isOpenModalGallery, setIsOpenModalGallery] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const refGallery = useRef(null);
    const images = dataProduct?.items ?? [];

    const dispatch = useDispatch();

    const [currentQuantity, setCurrentQuantity] = useState(1);
    const user = useSelector(state => state.account.user);
    const authenticated = useSelector(state => state.account.isAuthenticated);
    //Xử lý description
    const parseDescriptionToTable = (description) => {
        const parse = new DOMParser();
        const doc = parse.parseFromString(description, 'text/html');
        const listItems = doc.querySelectorAll('ul li');
        window.scrollTo({top: 0, behavior: 'smooth'});
        let tableRows = [];
        listItems.forEach(item => {
            const [key, value] = item.textContent.split(':');
            if (key && value) {
                tableRows.push({ key: key.trim(), value: value.trim() });
            }

        });
        return tableRows;
    };

    const descriptionData = parseDescriptionToTable(dataProduct?.description);

    const handleOnClickImage = () => {
        setIsOpenModalGallery(true);
        setCurrentIndex(refGallery?.current?.getCurrentIndex() ?? 0);
    };

    const handleChangeButton = (type) => {
        if (type === "MINUS") {
            if (currentQuantity - 1 <= 0) return;
            setCurrentQuantity(currentQuantity - 1);
        }
        if (type === "PLUS") {
            if (currentQuantity === +dataProduct.quantity) return;
            setCurrentQuantity(currentQuantity + 1);
        }
    };

    const handleChangeInput = (value) => {
        // Loại bỏ ký tự không phải số ngay khi nhập
        const numericValue = value.replace(/\D/g, '');

        // Kiểm tra giá trị hợp lệ và cập nhật
        if (numericValue === '') {
            setCurrentQuantity(''); // Cho phép xóa toàn bộ input
        } else {
            const numberValue = +numericValue;

            if (numberValue > 0 && numberValue <= +dataProduct.quantity) {
                setCurrentQuantity(numberValue); // Cập nhật giá trị hợp lệ
            } else if (numberValue > +dataProduct.quantity) {
                setCurrentQuantity(+dataProduct.quantity); // Giới hạn max
            }
        }
    };


    const handleAddToCart = (quantity, book) => {

        if(!authenticated) {
            message.info("Please login");
            return;
        }
        if(user?.role?.id === 1){
            message.info("Not support for admin");
            return;
        }

        dispatch(doAddBookAction({ quantity, detail: book, _id: book.id }));
    };

    return (
        <div style={{ background: '#dde8f8', padding: "20px 0" }}>
            <div className='view-detail-book' style={{ maxWidth: 1440, margin: '0 auto', minHeight: "calc(100vh - 150px)" }}>
                <div style={{ padding: "20px", background: '#fff', borderRadius: 5 }}>
                    {dataProduct && dataProduct.id ? (
                        <Row gutter={[20, 20]}>
                            <Col md={10} sm={0} xs={0}>
                                <ImageGallery
                                    ref={refGallery}
                                    items={images}
                                    showPlayButton={false}
                                    showFullscreenButton={false}
                                    renderLeftNav={() => <></>}
                                    renderRightNav={() => <></>}
                                    slideOnThumbnailOver={true}
                                    onClick={() => handleOnClickImage()}
                                />
                            </Col>
                            <Col md={14} sm={24}>
                                <Col md={0} sm={24} xs={24}>
                                    <ImageGallery
                                        ref={refGallery}
                                        items={images}
                                        showPlayButton={false}
                                        showFullscreenButton={false}
                                        renderLeftNav={() => <></>}
                                        renderRightNav={() => <></>}
                                        showThumbnails={false}
                                    />
                                </Col>
                                <Col span={24}>
                                    <div className=''>Category: <a href='#'>{dataProduct?.category?.name}</a></div>

                                    <div className=''>Brand: <a href='#'>{dataProduct?.brand?.name}</a></div>

                                    <div className='text-3xl'>{dataProduct?.name}</div>
                                    <div className='rating'>
                                        <Rate value={5} disabled style={{color: '#ffce3d', fontSize: 12}}/>
                                        <span className='sold'>

                                            <Divider type="vertical"/> Đã bán {dataProduct.sold}
                                        </span>
                                        <span className='sold'>
                                            <Divider type="vertical"/> Còn {dataProduct.quantity}
                                        </span>

                                    </div>
                                    <div className='price' style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                                        {dataProduct?.discount > 0 ? (
                                            <>
                                                <span style={{
                                                    textDecoration: 'line-through',
                                                    marginRight: '8px',
                                                    color: '#a9a9a9',
                                                }}>
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND'
                                                    }).format(dataProduct?.price ?? 0)}
                                                </span>

                                                <span className='currency' style={{
                                                    fontWeight: 'bold',
                                                    color: '#333',
                                                    marginRight: '8px'
                                                }}>
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND'
                                                    }).format(dataProduct.price * (1 - dataProduct.discount / 100))}
                                                </span>

                                                <span style={{
                                                    color: 'red',
                                                    fontWeight: '500',
                                                    backgroundColor: '#ffecec',
                                                    padding: '2px 6px',
                                                    borderRadius: '5px'
                                                }}>
                                                    -{dataProduct.discount}%
                                                </span>
                                            </>
                                        ) : (
                                            <span className='currency' style={{
                                                fontWeight: 'bold',
                                                color: '#333'
                                            }}>
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(dataProduct?.price ?? 0)}
                                            </span>
                                        )}
                                    </div>

                                    <div className='delivery'>
                                        <div>
                                            <span className='left-side'>Vận chuyển</span>
                                            <span className='right-side'>Miễn phí vận chuyển</span>
                                        </div>
                                    </div>
                                    <div className='quantity'>
                                        <span className='left-side'>Số lượng</span>
                                        <span className='right-side'>
                                            <button
                                                onClick={() => handleChangeButton('MINUS')}><MinusOutlined /></button>
                                            <input onChange={(even) => handleChangeInput(even.target.value)}
                                                value={currentQuantity} />
                                            <button onClick={() => handleChangeButton('PLUS')}><PlusOutlined /></button>
                                        </span>
                                    </div>

                                    <div className='flex space-x-4 mt-4'>
                                        <button
                                            className='flex items-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300'
                                            onClick={() => handleAddToCart(currentQuantity, dataProduct)}
                                        >
                                            <BsCartPlus className='mr-2 text-xl' />
                                            <span>Thêm vào giỏ hàng</span>
                                        </button>
                                    </div>


                                </Col>
                            </Col>
                        </Row>

                    ) : (
                        <BookLoader />
                    )}
                </div>
                <div className='description mt-4'>
                    <h3>Mô tả sản phẩm</h3>
                    <table className='description-table'>
                        <tbody>
                            {descriptionData.map((row, index) => (
                                <tr key={index}>
                                    <td className='spec-name'>{row.key}</td>
                                    <td className='spec-value'>{row.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
            <ModalGallery
                isOpen={isOpenModalGallery}
                setIsOpen={setIsOpenModalGallery}
                currentIndex={currentIndex}
                items={images}
                title={dataProduct?.name}
            />
        </div>

    )
}

export default ViewDetail;