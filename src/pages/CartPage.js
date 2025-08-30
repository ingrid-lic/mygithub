import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateCount } from '../redux/cartSlice';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

function CartPage() {
  const cartItems = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleCountChange = (id, delta) => {
    const item = cartItems.find(i => i.id === id);
    const newCount = item.count + delta;
    if (newCount > 0) {
      dispatch(updateCount({ id, count: newCount }));
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const handleCheckout = () => {
    navigate('/card-form');
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.count, 0);

  const totalPrice = cartItems.reduce((sum, item) => {
    const numericPrice = parseInt(item.price.replace('₩', '').replace(',', ''));
    return sum + numericPrice * item.count;
  }, 0);

  const deliveryFee = totalPrice >= 100000 || totalPrice === 0 ? 0 : 3000;
  const finalAmount = totalPrice + deliveryFee;

  return (
    <div className="cart-header">
      <div className="cart-top-bar">
        <button className="back-button" onClick={handleGoBack}><h2>{'←'}</h2></button>
      </div>
      <div className="cart-title-section">
        <h2>장바구니</h2>
        <p className="item-count-text">총 상품 수: {totalItems}개</p>
      </div>

      <ul className="cart-list">
        {cartItems.map(item => (
          <li key={item.id} className="cart-item">
            <img src={process.env.PUBLIC_URL + item.image} alt={item.desc} />
            <div className="item-info">
              <h3>{item.brand}</h3>
              <p>{item.desc}</p>
              <p>{item.price}</p>
              <div className="count-control">
                <button onClick={() => handleCountChange(item.id, -1)}>-</button>
                <span>{item.count}</span>
                <button onClick={() => handleCountChange(item.id, 1)}>+</button>
              </div>
            </div>
            <button className="remove-button" onClick={() => handleRemove(item.id)}>삭제</button>
          </li>
        ))}
      </ul>

      <div className="payment-summary">
        <div className="summary-row">
          <span className="label">상품 총액</span>
          <span className="value">{totalPrice.toLocaleString()}원</span>
      </div>
        <div className="summary-row">
          <span className="label">배송비</span>
          <span className="value">{deliveryFee.toLocaleString()}원</span>
      </div>
        <div className="summary-row total">
          <span className="label">총 결제 금액</span>
          <span className="value">{finalAmount.toLocaleString()}원</span>
      </div>
      </div>


      <button className="checkout-button" onClick={handleCheckout}>결제하기</button>
    </div>
  );
}

export default CartPage;
