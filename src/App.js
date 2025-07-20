import React, { useState } from 'react';
import './App.css';

const products = [
  {
    id: 1,
    image: '/shopping_img/shoes1.jpg',
    brand: '브랜드 A',
    desc: '편안하고 착용감이 좋은 신발',
    price: '₩35,000',
  },
  {
    id: 2,
    image: '/shopping_img/shoes2.jpg',
    brand: '브랜드 A',
    desc: '힙한 컬러가 매력적인 신발',
    price: '₩25,000',
  },
  {
    id: 3,
    image: '/shopping_img/shoes3.jpg',
    brand: '브랜드 B',
    desc: '편안하고 착용감이 좋은 신발',
    price: '₩35,000',
  },
  {
    id: 4,
    image: '/shopping_img/shoes4.jpg',
    brand: '브랜드 B',
    desc: '힙한 컬러가 매력적인 신발',
    price: '₩25,000',
  },
  {
    id: 5,
    image: '/shopping_img/shoes5.jpg',
    brand: '브랜드 C',
    desc: '편안하고 착용감이 좋은 신발',
    price: '₩35,000',
  },
  {
    id: 6,
    image: '/shopping_img/shoes6.jpg',
    brand: '브랜드 C',
    desc: '힙한 컬러가 매력적인 신발',
    price: '₩25,000',
  },
];

function Header({ cartCount }) {
  return (
    <header>
      <div className="header-container">
        <h1>ShoeKing</h1>
        <div className="cart-action-group">
          {cartCount > 0 && (
            <button className="cart-count-button">{cartCount}개 담김</button>
          )}
          <img src="/shopping_img/Shopping_cart.png" alt="장바구니" className="cart-icon" />
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

function ProductItem({ product, isAdded, onAdd }) {
  return (
    <div className="product-item">
      <img src={product.image} alt={`상품 이미지 ${product.id}`} />
      <h2 className="product-name">{product.brand}</h2>
      <p className="product-desc">{product.desc}</p>
      <p className="price">{product.price}</p>
      <button
        className={`add-to-cart ${isAdded ? 'clicked' : ''}`}
        onClick={() => onAdd(product.id)}
      >
        {isAdded ? '담김!' : '담기'}
      </button>
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
    <div className="app">
      <Header cartCount={cartCount} />
      <SectionTitle total={products.length} />
      <main>
        <ProductList
          products={products}
          addedItems={addedItems}
          addToCart={addToCart}
        />
      </main>
    </div>
  );
}

export default App;