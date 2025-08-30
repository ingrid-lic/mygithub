import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import './ProductDetail.css';
import { Link } from 'react-router-dom';

import products from '../data/Products';

function ProductDetail() {
  const { id } = useParams();
  const product = products.find(p => p.id === parseInt(id));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, count: 1 }));
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const relatedProducts = products.filter(p => p.id !== product.id);

  if (!product) return <p>상품을 찾을 수 없습니다.</p>;

  return (
    <div className="product-page">
      <div className="detail-header-bar">
        <button className="back-button" onClick={handleGoBack}><h2>←</h2></button>
      </div>

      <div className="product-detail">
        <img src={process.env.PUBLIC_URL + product.image} alt={product.desc} className="detail-image" />
        <h2>{product.brand}</h2>
        <p>{product.desc}</p>
        <p className="price">{product.price}</p>
        <button className="add-cart-button" onClick={handleAddToCart}>장바구니 담기</button>
      </div>

      <p className="recommend-text">
        다른 고객들이 함께 본 상품이에요. 스와이프해서 확인해보세요.
      </p>

      <div className="horizontal-scroll">
        {relatedProducts.map(item => (
          <Link to={`/product/${item.id}`} key={item.id} className="product-card">
            <img
              src={process.env.PUBLIC_URL + item.image}
              alt={`상품 ${item.id}`}
              className="scroll-image"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProductDetail;