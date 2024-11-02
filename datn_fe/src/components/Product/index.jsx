import { FilterTwoTone, ReloadOutlined } from '@ant-design/icons';
import { Row, Col, Form, Checkbox, Divider, InputNumber, Button, Rate, Tabs, Pagination, Spin, message } from 'antd';
import { useEffect, useState } from 'react';
import { callFetchBrand, callFetchCategory, callFetchProduct } from '../../services/api';
import './home.scss';
import { useNavigate, useOutletContext, useLocation } from "react-router-dom";

const Product = () => {
    // const { search } = useLocation(); // Dùng useLocation để lấy URL params
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [listCategory, setListCategory] = useState([]);
    const [listBrand, setListBrand] = useState([]);
    const navigate = useNavigate();
    const [listProduct, setListProduct] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("filter=category.active:'true' and brand.active:'true' and active:'true' and quantity > 0");
    const [sortQuery, setSortQuery] = useState("sort=sold,desc");
    const [form] = Form.useForm();

    // Lấy filter từ URL và giữ nguyên các filter trước đó
    // useEffect(() => {
    //     const params = new URLSearchParams(search);
    //     const urlFilter = params.get('filter') || ''; // Lấy filter từ URL nếu có
    //
    //     // Kết hợp filter từ URL với filter mặc định
    //     let combinedFilter = "filter=category.active:'true' and brand.active:'true' and active:'true' and quantity > 0";
    //
    //     if (urlFilter) {
    //         combinedFilter += ` and (${urlFilter})`;  // Kết hợp filter từ URL với filter mặc định
    //     }
    //
    //     setFilter(combinedFilter);  // Cập nhật filter state
    //     console.log("Current Filter: ", urlFilter); // Kiểm tra filter hiện tại
    //
    //     // Cập nhật form với category tương ứng
    //     const categoryMatches = urlFilter.match(/category\.name:'([^']+)'/);
    //     if (categoryMatches && categoryMatches[1]) {
    //         // Cập nhật giá trị cho category trong form
    //         form.setFieldsValue({
    //             category: [categoryMatches[1]] // Đặt giá trị cho category
    //         });
    //     } else {
    //         // Nếu không có category nào được chọn, đặt lại giá trị cho category
    //         form.setFieldsValue({
    //             category: [] // Reset category nếu không có filter
    //         });
    //     }
    //
    //     // Cập nhật form với thương hiệu tương ứng
    //     const brandMatches = urlFilter.match(/brand\.name:'([^']+)'/g) || [];
    //     const selectedBrandNames = brandMatches.map(match => match.split(':')[1].replace(/'/g, ''));
    //
    //     // Cập nhật giá trị cho brand trong form
    //     form.setFieldsValue({
    //         brand: selectedBrandNames // Đặt giá trị cho thương hiệu
    //     });
    //
    // }, [search]); // Theo dõi khi URL thay đổi


    // useEffect(() => {
    //     const term = location.state?.searchTerm;
    //     if (term) {
    //         setSearchTerm(term);
    //         updateFilter({ searchTerm: term });
    //     } else {
    //         fetchProduct(); // Gọi API nếu không có từ khóa
    //     }
    // }, [location.state?.searchTerm]);

    useEffect(() => {
        const term = location.state?.searchTerm || ""; // Đặt mặc định là chuỗi rỗng
        setSearchTerm(term);
        updateFilter({ searchTerm: term });
    }, [location.state?.searchTerm]);

    useEffect(() => {
        const initCategory = async () => {
            const res = await callFetchCategory();
            if (res && res.data) {
                const d = res.data
                    .filter(item => item.active)
                    .map(item => {
                        return { label: item.name, value: item.name };
                    });
                setListCategory(d);
            }
        }
        const initBrand = async () => {
            const res = await callFetchBrand();
            if (res && res.data) {
                const d = res.data
                    .filter(item => item.active)
                    .map(item => {
                        return { label: item.name, value: item.name };
                    });
                setListBrand(d);
            }
        }
        initCategory();
        initBrand();
    }, []);

    useEffect(() => {
        fetchProduct();
    }, [current, pageSize, filter, sortQuery, searchTerm]); //searchTerm

    const fetchProduct = async () => {
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchProduct(query);

        if (res && res.data) {
            setListProduct(res.data.result);
            setTotal(res.data.meta.total);
            if (res.data.result.length === 0) {
                message.info("Không tìm thấy sản phẩm"); // Hiển thị thông báo khi không có sản phẩm nào
            }
        }
        setIsLoading(false);
    };

    // Kiểm tra nếu location.state có thương hiệu hoặc danh mục thì cập nhật filter
    useEffect(() => {
        const values = {}; // Đối tượng chứa các giá trị lọc
        if (location.state?.brand) {
            values.brand = [location.state.brand];
            form.setFieldsValue({ brand: [location.state.brand] }); // Cập nhật form với brand từ state
        }else {
            form.setFieldsValue({ brand: [] }); // Reset brand nếu không có trong state
        }
        if (location.state?.category) {
            values.category = [location.state.category];
            form.setFieldsValue({ category: [location.state.category] }); // Cập nhật form với category từ state
        }else {
            form.setFieldsValue({ category: [] }); // Reset category nếu không có trong state
        }

        if (Object.keys(values).length > 0) {
            updateFilter(values); // Gọi updateFilter với giá trị từ state
        } else {
            fetchProduct(); // Gọi fetchProduct() nếu không có giá trị lọc
        }
    }, [location.state]);

    const handleOnchangePage = (pagination) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }

    const updateFilter = (values) => {
        let f = "filter=category.active:'true' and brand.active:'true' and active:'true' and quantity > 0"; // Default filter

        // Category filter
        if (values?.category?.length) {
            let cateFilter;
            if (values.category.length === 1) {
                cateFilter = `category.name%20%3A%27${values.category[0]}%27`;  // Single value
            } else {
                cateFilter = `category.name%20in%20%5B${values.category.map(c => `%27${c}%27`).join('%2C%20')}%5D`;  // Multiple values
            }
            f += ` and (${cateFilter})`;
        }

        // Brand filter
        if (values?.brand?.length) {
            let brandFilter;
            if (values.brand.length === 1) {
                brandFilter = `brand.name%20%3A%27${values.brand[0]}%27`;  // Single brand value
            } else {
                brandFilter = `brand.name%20in%20%5B${values.brand.map(b => `%27${b}%27`).join('%2C%20')}%5D`;  // Multiple brand values
            }
            f += ` and (${brandFilter})`;
        }

        // Price range filter
        if (values?.range?.from >= 0 && values?.range?.to >= 0) {
            f += ` and price>:${values.range.from} and price<:${values.range.to}`;
        }
        // Name filter
        if (values?.searchTerm) {
            f += ` and name~'${values.searchTerm}'`;
        }

        setFilter(f); // Update filter
    };


    const handleChangeFilter = (changedValues, values) => {
        if (changedValues.category || changedValues.brand) {
            updateFilter(values); // Update filter when category or brand changes
        }
    };


    const onFinish = (values) => {
        updateFilter(values); // Cập nhật filter khi form submit
    };


    const items = [
        {
            key: "sort=sold,desc",
            label: `Phổ biến`,
            children: <></>,
        },
        {
            key: 'sort=createdAt,desc',
            label: `Hàng Mới`,
            children: <></>,
        },
        {
            key: 'sort=price,asc',
            label: `Giá Thấp Đến Cao`,
            children: <></>,
        },
        {
            key: 'sort=price,desc',
            label: `Giá Cao Đến Thấp`,
            children: <></>,
        },
    ];

    const nonAccentVietnamese = (str) => {
        str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, "A");
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, "E");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/I|Í|Ì|Ĩ|Ị/g, "I");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, "O");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, "U");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, "Y");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/Đ/g, "D");
        str = str.replace(/đ/g, "d");
        // Some system encode vietnamese combining accent as individual utf-8 characters
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
        str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
        return str;
    }

    const convertSlug = (str) => {
        str = nonAccentVietnamese(str);
        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();

        // remove accents, swap ñ for n, etc
        const from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆĞÍÌÎÏİŇÑÓÖÒÔÕØŘŔŠŞŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇğíìîïıňñóöòôõøðřŕšşťúůüùûýÿžþÞĐđßÆa·/_,:;";
        const to = "AAAAAACCCDEEEEEEEEGIIIIINNOOOOOORRSSTUUUUUYYZaaaaaacccdeeeeeeeegiiiiinnooooooorrsstuuuuuyyzbBDdBAa------";
        for (let i = 0, l = from.length; i < l; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }

        str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes

        return str;
    }

    const handleRedirectProduct = (product) => {
        const slug = convertSlug(product.name);
        navigate(`/product/${slug}?id=${product.id}`);
    }

    return (
        <div style={{ background: '#dde8f8', padding: "20px 0" }}>
            <div className="homepage-container" style={{ maxWidth: 1440, margin: '0 auto' }}>
                <Row gutter={[20, 20]}>
                    <Col md={4} sm={0} xs={0}>
                        <div style={{ padding: "20px", background: '#fff', borderRadius: 5 }}>
                            <div style={{ display: 'flex', justifyContent: "space-between" }}>
                                <span> <FilterTwoTone />
                                    <span style={{ fontWeight: 500 }}> Bộ lọc tìm kiếm</span>
                                </span>
                                <ReloadOutlined title="Reset" onClick={() => {
                                    form.resetFields();
                                    setFilter("filter=category.active:'true' and active:'true' and quantity > 0");
                                }}
                                />
                            </div>
                            <Divider />

                            <Form
                                onFinish={onFinish}
                                form={form}
                                onValuesChange={(changedValues, values) => handleChangeFilter(changedValues, values)}
                            >
                                <Form.Item
                                    name="category"
                                    label="Danh mục sản phẩm"
                                    labelCol={{ span: 24 }}
                                >
                                    <Checkbox.Group>
                                        <Row>
                                            {listCategory?.map((item, index) => {
                                                return (
                                                    <Col span={24} key={`index-${index}`} style={{ padding: '7px 0' }}>
                                                        <Checkbox value={item.value}>
                                                            {item.label}
                                                        </Checkbox>
                                                    </Col>
                                                )
                                            })}
                                        </Row>
                                    </Checkbox.Group>
                                </Form.Item>
                                <Divider />

                                <Form.Item
                                    name="brand"
                                    label="Thương hiệu"
                                    labelCol={{ span: 24 }}
                                >
                                    <Checkbox.Group>
                                        <Row>
                                            {listBrand?.map((item, index) => {
                                                return (
                                                    <Col span={24} key={`index-brand-${index}`}
                                                         style={{ padding: '7px 0' }}>
                                                        <Checkbox value={item.value}>
                                                            {item.label}
                                                        </Checkbox>
                                                    </Col>
                                                )
                                            })}
                                        </Row>
                                    </Checkbox.Group>
                                </Form.Item>
                                <Divider />


                                <Form.Item
                                    label="Khoảng giá"
                                    labelCol={{ span: 24 }}
                                >
                                    <Row gutter={[10, 10]} style={{ width: "100%" }}>
                                        <Col xl={11} md={24}>
                                            <Form.Item name={["range", 'from']}>
                                                <InputNumber
                                                    name='from'
                                                    min={0}
                                                    placeholder="đ TỪ"
                                                    // formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xl={2} md={0}>
                                            <div> -</div>
                                        </Col>
                                        <Col xl={11} md={24}>
                                            <Form.Item name={["range", 'to']}>
                                                <InputNumber
                                                    name='to'
                                                    min={0}
                                                    placeholder="đ ĐẾN"
                                                    // formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <div>
                                        <Button onClick={() => form.submit()}
                                                style={{ width: "100%" }} type='primary'>Áp dụng</Button>
                                    </div>
                                </Form.Item>
                                <Divider />
                                {/*<Form.Item*/}
                                {/*    label="Đánh giá"*/}
                                {/*    labelCol={{span: 24}}*/}
                                {/*>*/}
                                {/*    <div>*/}
                                {/*        <Rate value={5} disabled style={{color: '#ffce3d', fontSize: 15}}/>*/}
                                {/*        <span className="ant-rate-text"></span>*/}
                                {/*    </div>*/}
                                {/*    <div>*/}
                                {/*        <Rate value={4} disabled style={{color: '#ffce3d', fontSize: 15}}/>*/}
                                {/*        <span className="ant-rate-text">trở lên</span>*/}
                                {/*    </div>*/}
                                {/*    <div>*/}
                                {/*        <Rate value={3} disabled style={{color: '#ffce3d', fontSize: 15}}/>*/}
                                {/*        <span className="ant-rate-text">trở lên</span>*/}
                                {/*    </div>*/}
                                {/*    <div>*/}
                                {/*        <Rate value={2} disabled style={{color: '#ffce3d', fontSize: 15}}/>*/}
                                {/*        <span className="ant-rate-text">trở lên</span>*/}
                                {/*    </div>*/}
                                {/*    <div>*/}
                                {/*        <Rate value={1} disabled style={{color: '#ffce3d', fontSize: 15}}/>*/}
                                {/*        <span className="ant-rate-text">trở lên</span>*/}
                                {/*    </div>*/}
                                {/*</Form.Item>*/}
                            </Form>
                        </div>
                    </Col>

                    <Col md={20} xs={24}>
                        <Spin spinning={isLoading} tip="Loading...">
                            <div style={{ padding: "20px", background: '#fff', borderRadius: 5 }}>
                                <Row>
                                    <Tabs
                                        defaultActiveKey="sort=-sold"
                                        items={items}
                                        onChange={(value) => {
                                            setSortQuery(value)
                                        }}
                                        style={{ overflowX: "auto" }}
                                    />
                                </Row>
                                <Row className='customize-row'>
                                    {listProduct?.map((item, index) => {
                                        return (
                                            <div className="column" key={`product-${index}`}
                                                 onClick={() => handleRedirectProduct(item)}>
                                                <div className='wrapper'>
                                                    <div className='thumbnail'>
                                                        <img
                                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/product/${item.thumbnail}`}
                                                            alt="Thumbnail Product" />
                                                    </div>
                                                    <div className='text' title={item.name}>{item.name}</div>
                                                    <div className='price'>
                                                        {item?.discount > 0 ? (
                                                            <>
                                                                {/* Original price and discount percentage */}
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    marginBottom: '5px'
                                                                }}>
                                                                    {/* Original price with strikethrough */}
                                                                    <span style={{
                                                                        textDecoration: 'line-through',
                                                                        color: '#a9a9a9',
                                                                        fontSize: '14px',
                                                                        marginRight: '8px',
                                                                    }}>
                                                                        {new Intl.NumberFormat('vi-VN', {
                                                                            style: 'currency',
                                                                            currency: 'VND'
                                                                        }).format(item.price)}
                                                                    </span>

                                                                    {/* Discount percentage */}
                                                                    <span style={{
                                                                        color: 'red',
                                                                        fontSize: '14px',
                                                                        fontWeight: 500,
                                                                        backgroundColor: '#ffecec',
                                                                        padding: '2px 6px',
                                                                        borderRadius: '5px',
                                                                    }}>
                                                                        -{item.discount}%
                                                                    </span>
                                                                </div>

                                                                {/* New discounted price */}
                                                                <div style={{
                                                                    fontSize: '16px',
                                                                    fontWeight: 'bold',
                                                                    color: '#333',
                                                                }}>
                                                                    {new Intl.NumberFormat('vi-VN', {
                                                                        style: 'currency',
                                                                        currency: 'VND'
                                                                    }).format(item.price * (1 - item.discount / 100))}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            // Show the regular price if no discount
                                                            <span style={{
                                                                fontWeight: 'bold',
                                                                fontSize: '16px',
                                                                color: '#333',
                                                            }}>
                                                                {new Intl.NumberFormat('vi-VN', {
                                                                    style: 'currency',
                                                                    currency: 'VND'
                                                                }).format(item.price)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className='rating'>
                                                        <Rate value={5} disabled
                                                              style={{ color: '#ffce3d', fontSize: 10 }} />
                                                        <span>Đã bán {item.sold}</span>
                                                    </div>
                                                </div>
                                            </div>

                                        )
                                    })}

                                </Row>
                                <div style={{ marginTop: 30 }}></div>
                                <Row style={{ display: "flex", justifyContent: "center" }}>
                                    <Pagination
                                        current={current}
                                        total={total}
                                        pageSize={pageSize}
                                        responsive
                                        onChange={(p, s) => handleOnchangePage({ current: p, pageSize: s })}
                                    />
                                </Row>
                            </div>
                        </Spin>
                    </Col>

                </Row>
            </div>
        </div>
    )
}

export default Product;
