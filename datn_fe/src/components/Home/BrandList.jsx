import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate và useLocation để điều hướng
import { callFetchListBrand } from '../../services/api';
import './BrandList.css';

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate(); // Khởi tạo useNavigate
  // const location = useLocation(); // Khởi tạo useLocation
  // const search = location.search; // Lấy search từ location

  // // Hàm xử lý điều hướng khi click vào thương hiệu
  // const handleBrand = (brand) => {
  //   // Lấy các filter hiện có từ URL
  //   const params = new URLSearchParams(search);
  //   const currentFilter = params.get('filter') || "category.active:'true' and brand.active:'true' and active:'true' and quantity > 0";
  //
  //   // Thêm filter mới cho brand
  //   const newFilter = `${currentFilter} and brand.name:'${brand}'`; // Sửa đổi từ category thành brand
  //
  //   // Điều hướng đến trang sản phẩm với bộ lọc kết hợp
  //   navigate(`/product?filter=${encodeURIComponent(newFilter)}`);
  // };

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await callFetchListBrand();
      if (res && res.data && Array.isArray(res.data.result)) {
        const activeBrands = res.data.result.filter(brand => brand.active === true);
        setBrands(activeBrands);
        console.log('Thương hiệu:', activeBrands);
      } else {
        console.error('Invalid data format received from API');
        setBrands([]);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    }
  };

  // const handleBrandClick = (brandName) => {
  //   console.log('Thương hiệu được chọn:', brandName);
  //   handleBrand(brandName); // Gọi hàm handleBrand khi click vào thương hiệu
  //
  //   //Cuộn lên đầu trang khi lọc xong
  //   window.scrollTo({top: 0, behavior: 'smooth'});
  // };

  const handleBrandClick = (brandName) => {
    navigate('/product', { state: { brand: brandName } });
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
    <div className="brand-section">
      <div className="brand-list">
        {brands.map((brand) => (
          <div
            key={brand.name}
            className={`brand-item ${brand.name.toLowerCase()}`}
            onClick={() => handleBrandClick(brand.name)}
          >
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/storage/brand/${brand.thumbnail}`}
              alt={brand.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
  
};

export default BrandList;
