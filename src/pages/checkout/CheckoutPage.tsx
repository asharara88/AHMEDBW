import { useNavigate } from 'react-router-dom';
import CheckoutForm from '../../components/shopping/CheckoutForm';
import { CartProvider } from '../../components/shopping/CartProvider';

const CheckoutPage = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/supplements');
  };

  return (
    <CartProvider>
      <CheckoutForm onBack={handleBack} />
    </CartProvider>
  );
};

export default CheckoutPage;