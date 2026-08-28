import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const StripeProvider = ({ children, clientSecret }) => {
  if (!clientSecret) return children;

  return (
    <Elements stripe={stripePromise} options={{
      clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#7C3AED',
          colorBackground: '#ffffff',
          colorText: '#1F2937',
          borderRadius: '12px'
        }
      }
    }}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
