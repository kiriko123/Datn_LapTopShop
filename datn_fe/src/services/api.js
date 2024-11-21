import axios from '../utils/axios-customize.js';

// Hàm cho tài khoản
export const callRegister = ({ name, email, password, confirmPassword, firstName }) => {
    return axios.post('/api/v1/auth/register', { name, email, password, confirmPassword, firstName });
}

export const callLogin = ({ username, password }) => {
    return axios.post('/api/v1/auth/login', { username, password });
}

export const callFetchAccount = () => {
    return axios.get("/api/v1/auth/account");
}

export const callForgot = ({ email }) => {
    return axios.post("/api/v1/auth/forgot", { email });
}

export const callLogout = () => {
    return axios.post("/api/v1/auth/logout");
}

export const callChangePassword = ({ email, password, newPassword, confirmPassword }) => {
    return axios.post('/api/v1/auth/change-password', { email, password, newPassword, confirmPassword });
}

export const callUpdateInfo = ({ id, firstName, name, userAvatar, gender, age, phoneNumber, address }) => {
    return axios.post('/api/v1/auth/update-info', { id, firstName, name, imageUrl: userAvatar, gender, age, phoneNumber, address });
}

// Hàm cho người dùng
export const callFetchListUser = (query) => {
    return axios.get(`/api/v1/user?${query}`);
}

export const callDeleteUser = (userId) => {
    return axios.delete(`/api/v1/user/${userId}`);
}

export const callCreateUser = ({ name, firstName, email, password, passwordConfirm, age, gender, address, phoneNumber }) => {
    return axios.post('/api/v1/user', { name, firstName, email, password, passwordConfirm, age, gender, address, phoneNumber });
}

export const callBulkCreateUser = (data) => {
    return axios.post('/api/v1/user/bulk-create', data);
}

export const callUpdateUser = ({ id, name, firstName, email, age, gender, address, phoneNumber }) => {
    return axios.put(`/api/v1/user`, { id, name, firstName, email, age, gender, address, phoneNumber });
}

// Hàm cho file
export const callUploadFile = (file, folder) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    return axios.post('/api/v1/files', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

// Hàm cho Slider
export const callGetSliders = () => {
    return axios.get('/api/v1/sliders'); // Đảm bảo URL chính xác
};
export const callFetchListSlider = (query) => {
    return axios.get(`/api/v1/sliders?${query}`);
}

export const callDeleteSlider = (sliderId) => {
    return axios.delete(`/api/v1/sliders/${sliderId}`);
}

export const callCreateSlider = ({ title, description, imgUrl }) => {
    return axios.post('/api/v1/sliders', { title, description, imgUrl });
}

export const callUpdateSlider = ({ id, title, description, imgUrl }) => {
    return axios.put(`/api/v1/sliders`, { id, title, description, imgUrl });
}



export const callFetchListBrand = (query) => {

    return axios.get(`/api/v1/brand?${query}`);
}

export const callDeleteBrand = (brandId) => {
    return axios.delete(`/api/v1/brand/${brandId}`);
}

export const callCreateBrand = ({ name, description, thumbnail }) => {
    return axios.post('/api/v1/brand', { name, description, thumbnail });
}

export const callUpdateBrand = ({ id, name, description, thumbnail, active }) => {
    return axios.put(`/api/v1/brand`, { id, name, description, thumbnail, active });
}

// Hàm cho Category
export const callFetchListCategory = (query) => {
    return axios.get(`/api/v1/category?${query}`);
}

export const callCreateCategory = ({ name, thumbnail, description, hot }) => {
    return axios.post('/api/v1/category', { name, thumbnail, description, hot });
}

export const callDeleteCategory = (categoryId) => {
    return axios.delete(`/api/v1/category/${categoryId}`);
}

export const callUpdateCategory = ({ id, name, thumbnail, description, hot, active }) => {
    return axios.put(`/api/v1/category`, { id, name, thumbnail, description, hot, active });
}
////////////////////////// product crud api//////////////////////////////////
export const callFetchCategory = () => {
    return axios.get(`/api/v1/category/getAll`);
}
export const callFetchBrand = () => {
    return axios.get(`/api/v1/brand/getAll`);
}
export const callFetchProduct = (query) => {
    return axios.get(`/api/v1/product?${query}`);
}
export const callCreateProduct = ({ name, price, discount, thumbnail, quantity, sold, description, sale, hot, images, categoryId, brandId }) => {
    return axios.post('/api/v1/product', { name, price, discount, thumbnail, quantity, sold, description, sale, hot, images, categoryId, brandId });
}
export const callUpdateProduct = ({ id, name, price, discount, thumbnail, quantity, sold, description, sale, hot, images, categoryId, brandId, active }) => {
    return axios.put('/api/v1/product', { id, name, price, discount, thumbnail, quantity, sold, description, sale, hot, images, categoryId, brandId, active });
}
export const callDeleteProduct = (productId) => {
    return axios.delete(`/api/v1/product/${productId}`);
}
export const callFetchProductById = (id) => {
    return axios.get(`api/v1/product/${id}`)
}
////////////////////////////////////////////////////////////////////////////////

//////// check out ///////
export const callCheckOut = (data) => {
    return axios.post('/api/v1/payment/create-payment-intent', data);
}
export const callPlaceOrder = (data) => {
    return axios.post('/api/v1/order', {
        ...data
    })
}
export const callOrderHistory = (id) => {
    return axios.get(`/api/v1/order/${id}`);
}
export const callGetAllOrder = (query) => {
    return axios.get(`/api/v1/order?${query}`);
}
export const callUserUpdateOrder = (orderData) => {
    return axios.put('/api/v1/order/user-update', {
        id: orderData.id,
        address: orderData.address,
        currentStatus: orderData.currentStatus,
        newStatus: orderData.newStatus,
        description: orderData.description
    });
};

// order at admin page
export const callFetchOrder = (query) => {
    return axios.get(`/api/v1/order?${query}`);
}
//order update at admin
export const callAdminUpdateOrder = (orderData) => {
    return axios.put('/api/v1/order/admin-update', {
        id: orderData.id,
        address: orderData.address,
        currentStatus: orderData.currentStatus,
        newStatus: orderData.newStatus,
        description: orderData.description
    });
};
//////////////////////
//Thong ke
export const callCountAll = () => {
    return axios.get(`/api/v1/statistics/count-all`);
}
export const callTotalPriceByYear = () => {
    return axios.get(`/api/v1/statistics/total-price-by-year`);
}
export const callTotalPriceByMonth = () => {
    return axios.get(`/api/v1/statistics/total-price-by-month`);
}
export const callTotalPriceByDate = () => {
    return axios.get(`/api/v1/statistics/total-price-by-date`);
}
// Thống kê đơn hàng theo năm
export const callOrdersByYear = (year) => {
    return axios.get(`/api/v1/statistics/orders-by-year/${year}`);
}

// Thống kê đơn hàng theo tháng
export const callOrdersByMonth = (year, month) => {
    return axios.get(`/api/v1/statistics/orders-by-month/${year}/${month}`);
}

//////////////////////

///////////////////////////////////
export const callFetchRatings = (productId) => {
    return axios.get(`/api/v1/ratings/${productId}`);
};

export const callSubmitRating = (productId, ratingData) => {
    return axios.post(`/api/v1/ratings/${productId}`, ratingData);
};
export const callUpdateRating = ({ id, adminRespone }) => {
    return axios.put(`/api/v1/ratings`, { id, adminRespone });
};


// voucher
export const callFetchListVoucher = (query) => {
    return axios.get(`/api/v1/voucher?${query}`);
}

export const callDeleteVoucher = (voucherId) => {
    return axios.delete(`/api/v1/voucher/${voucherId}`);
}

export const callCreateVoucher = ({ voucherCode, voucherValue, priceApply, description, startDate, endDate }) => {
    return axios.post('/api/v1/voucher', { voucherCode, voucherValue, priceApply, description, startDate, endDate });
}

export const callUpdateVoucher = ({ id, voucherCode, voucherValue, priceApply, description, startDate, endDate, active }) => {
    return axios.put('/api/v1/voucher', { id, voucherCode, voucherValue, priceApply, description, startDate, endDate, active });
}
// voucher
export const callApiGet  = (userId) => {
    return axios.get(`/api/v1/user-voucher/${userId}/available-vouchers`);
};


