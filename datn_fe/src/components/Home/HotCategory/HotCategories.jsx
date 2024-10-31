import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate và useLocation
import HotCategoryHeader from './HotCategoryHeader';
import HotCategoryCard from './HotCategoryCard';
import { callFetchListCategory } from '../../../services/api';
import './HotCategories.css';

const HotCategories = () => {
    const [categories, setCategories] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const navigate = useNavigate(); 
    const { search } = useLocation(); // Lấy URL params hiện tại

    // const handleRedirectCategory = (category) => {
    //     // Lấy các filter hiện có từ URL
    //     const params = new URLSearchParams(search);
    //     const currentFilter = params.get('filter') || "category.active:'true' and brand.active:'true' and active:'true' and quantity > 0";
    //
    //     // Thêm filter mới cho category
    //     const newFilter = `${currentFilter} and category.name:'${category.name}'`;
    //
    //     // Điều hướng đến trang sản phẩm với bộ lọc kết hợp
    //     navigate(`/product?filter=${encodeURIComponent(newFilter)}`);
    //
    //     //Cuộn lên đầu trang khi lọc xong
    //     window.scrollTo({top: 0, behavior: 'smooth'});
    // };


    

    useEffect(() => {
        const fetchHotCategories = async () => {
            try {
                const response = await callFetchListCategory('hot=true&active=true');
                console.log('API Response:', response);
                if (response && response.data) {
                    if (Array.isArray(response.data.result)) {
                        // Lọc các category có `hot` và `active` bằng true
                        const filteredCategories = response.data.result.filter(category => category.hot && category.active);
                        setCategories(filteredCategories.slice(0, 3)); // Chỉ lấy 3 category hot và active
                    } else {
                        console.error('response.data.result is not an array:', response.data.result);
                    }
                }
            } catch (error) {
                console.error('Error fetching hot categories:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchHotCategories();
    }, []);

    const handleBrandClick = (categoryName) => {
        navigate('/product', { state: { category: categoryName } });
        window.scrollTo({top: 0, behavior: 'smooth'});
    };
    return (
        <div>
            <HotCategoryHeader />
            <div className="product-container">
                {loading ? ( 
                    <div>Loading...</div>
                ) : (
                    categories.map((category) => (
                        <HotCategoryCard 
                            key={category.id} 
                            category={category}
                            onClick={() => handleBrandClick(category.name)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default HotCategories;
