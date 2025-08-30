import React, { useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import CardForm from './pages/CardForm';
import CardAdd from './pages/CardAdd';
import CardList from './pages/CardList';
import CartPage from './pages/CartPage';
import ProductDetail from './pages/ProductDetail';
import PaymentComplete from "./pages/PaymentComplete";
import { CardProvider } from './context/CardContext';
import { store } from './redux/store';
import { addToCart } from './redux/cartSlice';
import './App.css';

import products from './data/Products';

function Header() {
  const navigate = useNavigate();
  const cartItems = useSelector(state => state.cart);

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <header>
      <div className="header-container">
        <h1>ShoeKing</h1>
        <div className="cart-action-group">
          {cartItems.length > 0 && (
            <button className="cart-count-button">{cartItems.length}개 담김</button>
          )}
          <img
            src={process.env.PUBLIC_URL + "/shopping_img/Shopping_cart.png"}
            alt="장바구니"
            className="cart-icon"
            onClick={handleCartClick}
          />
        </div>
      </div>
    </header>
  );
}



function SectionTitle({ total }) {
  return (
    <div className="section-title">
      <h1>신발 상품 목록</h1>
      <h3>현재 {total}개의 상품이 있습니다.</h3>
    </div>
  );
}

function ProductItem({ product }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart);
  const navigate = useNavigate();

  const handleItemClick = () => {
    navigate(`/product/${product.id}`);
  };

  const isAdded = cartItems.some(item => item.id === product.id);

  const handleAddToCart = () => {
    if (!isAdded) {
      dispatch(addToCart({ ...product, count: 1 }));
    }
  };

  const handlePurchaseClick = () => {
    navigate('/card-form');
  };

  return (
    <div className="product-item" onClick={handleItemClick}>
      <img src={process.env.PUBLIC_URL + product.image} alt={`상품 이미지 ${product.id}`} />
      <h2 className="product-name">{product.brand}</h2>
      <p className="product-desc">{product.desc}</p>
      <p className="price">{product.price}</p>
      <div className="button-group">
        <button
          className={`add-to-cart ${isAdded ? 'clicked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
        >
          {isAdded ? '담김!' : '담기'}
        </button>
        <button
          className="purchase-button"
          onClick={(e) => {
            e.stopPropagation();
            handlePurchaseClick();
          }}
        >
          구매
        </button>
      </div>
    </div>
  );
}


function ProductList({ products, addedItems, addToCart }) {
  return (
    <section className="product-list">
      {products.map((product) => (
        <ProductItem
          key={product.id}
          product={product}
          isAdded={addedItems.includes(product.id)}
          onAdd={addToCart}
        />
      ))}
    </section>
  );
}

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [addedItems, setAddedItems] = useState([]);

  const addToCart = (productId) => {
    if (!addedItems.includes(productId)) {
      setCartCount(cartCount + 1);
      setAddedItems([...addedItems, productId]);
    }
  };

   return (
    <CardProvider>
      <Provider store={store}>
      <Router>
      <div className="app">
        <Header cartCount={cartCount} />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <SectionTitle total={products.length} />
                <main>
                  <ProductList
                    products={products}
                    addedItems={addedItems}
                    addToCart={addToCart}
                  />
                </main>
              </>
            }
          />
          <Route path="/card-form" element={<CardForm />} />
          <Route path="/card-add" element={<CardAdd />} />
          <Route path="/card-list" element={<CardList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/payment-complete" element={<PaymentComplete />} />
        </Routes>
      </div>
    </Router>
    </Provider>
  </CardProvider>  
  );
}

export default App;