import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./PaymentComplete.css";

const PaymentComplete = () => {
  const navigate = useNavigate();
  const cartItems = useSelector(state => state.cart);

  const purchasedItemsCount = cartItems.reduce((sum, item) => sum + item.count, 0);

  const totalAmount = cartItems.reduce((sum, item) => {
    const numericPrice = parseInt(item.price.replace('₩', '').replace(',', ''));
    return sum + numericPrice * item.count;
  }, 0);

  const deliveryFee = totalAmount >= 100000 || totalAmount === 0 ? 0 : 3000;
  const finalAmount = totalAmount + deliveryFee;

  const handleGoToProductList = () => {
    navigate("/");
  };

  return (
    <div className="payment-complete-container">
      <h2 className="complete-title">결제 완료!</h2>
      <p className="complete-summary">
        총 <strong>{purchasedItemsCount}개</strong>의 상품을 구매하셨습니다.
      </p>
      <p className="complete-amount">
        총 결제 금액: <strong>{finalAmount.toLocaleString()}원</strong>
      </p>
      <button className="go-to-list-button" onClick={handleGoToProductList}>
        상품 목록 보기
      </button>
    </div>
  );
};

export default PaymentComplete;
