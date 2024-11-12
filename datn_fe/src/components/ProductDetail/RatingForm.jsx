import React, { useState, useEffect } from 'react';
import { callSubmitRating, callFetchRatings, callUpdateRating } from '../../services/api';
import './RatingForm.css';
import moment from 'moment';
import { message } from 'antd';
import { useSelector } from "react-redux";

const RatingForm = ({ productId }) => {
    const [content, setContent] = useState('');
    const [numberStars, setNumberStars] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [adminResponse, setAdminResponse] = useState('');
    const [selectedRatingId, setSelectedRatingId] = useState(null);
    const [showAllRatings, setShowAllRatings] = useState(false);
    const [collapsed, setCollapsed] = useState(true);

    const user = useSelector(state => state.account.user);

    const fetchRatings = async () => {
        try {
            const response = await callFetchRatings(productId);
            const updatedRatings = response.data.map(rating => ({
                ...rating,
                userName: rating.user.name || 'Người dùng ẩn danh'
            }));
            setRatings(updatedRatings);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách đánh giá:', err);
        }
    };

    useEffect(() => {
        fetchRatings();
    }, [productId]);

    const handleStarClick = (stars) => {
        setNumberStars(stars);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (user.email === "") {
            message.info("Vui lòng đăng nhập!");
            return;
        }

        if (numberStars < 1) {
            message.info("Vui lòng chọn số sao đánh giá!");
            return;
        }

        try {
            const rating = { content, numberStars };
            await callSubmitRating(productId, rating);
            setSuccess('Đánh giá của bạn đã được gửi thành công!');
            setContent('');
            setNumberStars(0);
            setError(null);
            fetchRatings();
        } catch (err) {
            setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
            setSuccess(null);
        }
    };

    const handleAdminResponseSubmit = async (ratingId) => {
        if (!adminResponse) {
            setError("Vui lòng nhập nội dung phản hồi.");
            return;
        }

        try {
            await callUpdateRating({ id: ratingId, adminRespone: adminResponse });
            // Cập nhật adminResponse trực tiếp vào `ratings`
        setRatings(prevRatings => prevRatings.map(rating => {
            if (rating.id === ratingId) {
                return {
                    ...rating,
                    adminResponse: {
                        content: adminResponse,
                        createdAt: new Date(), // Giả lập thời gian phản hồi
                        userName: user.name,   // Thêm tên của admin
                        userImage: user.imageUrl // Thêm ảnh của admin
                    }
                };
            }
            return rating;
        }));
            setAdminResponse(''); // Clear response input
            setSelectedRatingId(null); // Deselect rating after submitting response
            // fetchRatings(); // Refresh ratings list after successful submission
        } catch (err) {
            console.error('Lỗi khi gửi phản hồi:', err);
            setError('Đã có lỗi xảy ra khi gửi phản hồi.');
        }
    };

    const countRatingsByStars = () => {
        const counts = [0, 0, 0, 0, 0];
        ratings.forEach(rating => {
            counts[rating.numberStars - 1]++;
        });
        return counts;
    };

    const starCounts = countRatingsByStars();
    const totalStar = ratings.reduce((acc, rating) => acc + rating.numberStars, 0);
    const averageRating = ratings.length > 0 ? (totalStar / ratings.length).toFixed(1) : 0;

    const renderStars = () => {
        return (
            <div className="star-container" style={{ display: 'flex', gap: '5px' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                    const fillPercentage = Math.min(Math.max(averageRating - star + 1, 0), 1) * 100;
                    return (
                        <div key={star} className="star-wrapper" style={{ position: 'relative', fontSize: '30px' }}>
                            <span className="star-full" style={{
                                position: 'absolute', top: 0, left: 0,
                                width: `${fillPercentage}%`, overflow: 'hidden',
                                color: '#f1c40f', fontSize: '30px',
                            }}>★</span>
                            <span className="star-full" style={{
                                color: '#ccc', position: 'relative',
                                zIndex: -1, fontSize: '30px',
                            }}>★</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="rating-form">
            <h2>Khách hàng nói về sản phẩm</h2>
            <div className="count-rating-container">
                <div className="count-rating">
                    <div className="big-star-container">
                        <span className="average-rating-number">{averageRating}</span>
                        <div className="total-ratings">{ratings.length} lượt đánh giá</div>
                        {renderStars()}
                    </div>
                </div>
                <div className="average-rating">
                    {starCounts.map((count, index) => (
                        <div key={index} className="progress-bar-wrapper">
                            <div className="star-label">{index + 1} ★</div>
                            <div className="progress-bar">
                                <div
                                    className="progress"
                                    style={{ width: `${(count / ratings.length) * 100 || 0}%`, backgroundColor: '#e74c3c' }}
                                />
                            </div>
                            <div className="count-label">{count} </div>
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`star ${numberStars >= star ? 'filled' : ''}`}
                            onClick={() => handleStarClick(star)}
                            style={{ fontSize: 60 }}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <div>
                    <label htmlFor="content">Nội dung đánh giá:</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                    />
                </div>
                <button type="submit">Gửi đánh giá</button>
            </form>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <div className="ratings-list">
                {ratings.length === 0 ? (
                    <p>Chưa có đánh giá nào.</p>
                ) : (
                    <>
                        {(!collapsed ? ratings : ratings.slice(0, showAllRatings ? ratings.length : 2)).map((rating) => (
                            <div key={rating.id} className="rating-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <div className="user-image" style={{ marginRight: '15px' }}>
                                    <img
                                        src={`${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${rating.user.imageUrl}`}
                                        alt={rating.userName}
                                        style={{ width: '50px', height: '50px', borderRadius: '50%', display: 'block' }}
                                    />
                                </div>

                                <div className="rating-info" style={{ flexGrow: 1 }}>
                                    <div className="name-user">
                                        <p>
                                            <strong>{rating.userName || 'Người dùng ẩn danh'}</strong>{' '}
                                            <span className="rating-date">({moment(rating.createdAt).format('DD/MM/YYYY HH:mm')})</span>
                                        </p>
                                    </div>
                                    <div className="star-user">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span key={star} className={`star ${rating.numberStars >= star ? 'filled' : ''}`}>
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <div>{rating.content}</div> {/* Hiển thị nội dung đánh giá ở đây */}

                                    {rating.adminResponse && (
    <div className="admin-response" style={{ marginTop: '10px', paddingLeft: '10px', borderLeft: '2px solid #ccc' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <img
                src={`${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${rating.adminResponse.userImage}`} // Thay đổi từ `rating.user.imageUrl` sang `rating.adminResponse.userImage`
                alt="Admin"
                style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
            />
            <div>
                <strong>{rating.adminResponse.userName}</strong> // Thay đổi từ "Admin" thành `{rating.adminResponse.userName}`
                <span className="response-date"> ({moment(rating.adminResponse.createdAt).format('DD/MM/YYYY HH:mm')})</span>
            </div>
        </div>
        <p>{rating.adminResponse.content}</p>
    </div>
)}


                                    <div className="admin-reply">
                                        {selectedRatingId === rating.id ? (
                                            <>
                                                <textarea
                                                    value={adminResponse}
                                                    onChange={(e) => setAdminResponse(e.target.value)}
                                                    placeholder="Nhập phản hồi của bạn..."
                                                    style={{ width: '100%', marginTop: '5px' }}
                                                />
                                                <button onClick={() => handleAdminResponseSubmit(rating.id)}>Gửi phản hồi</button>
                                            </>
                                        ) : (
                                            <button className="reply-button" onClick={() => { setSelectedRatingId(rating.id); setAdminResponse(''); }}>
                                                <span className="arrow">➤</span>
                                                Trả lời
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div style={{ marginTop: '20px' }}>
                            {collapsed ? (
                                <button onClick={() => setCollapsed(false)}>Xem tất cả đánh giá</button>
                            ) : (
                                <button onClick={() => setCollapsed(true)}>Thu gọn</button>
                            )}
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};

export default RatingForm;
