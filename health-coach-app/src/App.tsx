import React from 'react';
import { CartProvider } from './store/cartStore';
import ChatInterface from './components/Chat/ChatInterface';
import Cart from './components/Cart/Cart';

const App = () => {
    return (
        <CartProvider>
            <div>
                <ChatInterface />
                <Cart />
            </div>
        </CartProvider>
    );
};

export default App;