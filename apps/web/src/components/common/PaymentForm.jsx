import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';

const PaymentForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe is still loading. Please wait.');
      return;
    }

    setProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/bookings'
        },
        redirect: 'if_required'
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        if (onError) onError(error);
      } else {
        toast.success('Payment successful!');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      toast.error('Payment failed. Please try again.');
      if (onError) onError(err);
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded-3" style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(236,72,153,0.06))',
          border: '1px solid rgba(124,58,237,0.1)'
        }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--velora-muted)' }}>Amount to Pay</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--velora-primary)' }}>
            {formatCurrency(amount)}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label-velora fw-semibold mb-2">Payment Details</label>
        <div style={{
          border: '1.5px solid var(--velora-border)',
          borderRadius: 'var(--velora-radius)',
          padding: '12px',
          background: '#fff'
        }}>
          <PaymentElement options={{
            layout: 'tabs',
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto'
              }
            }
          }} />
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 mb-3" style={{ fontSize: '0.8rem', color: 'var(--velora-muted)' }}>
        <i className="bi bi-shield-check" style={{ color: 'var(--velora-success)' }}></i>
        <span>Your payment is secured by Stripe. We never store your card details.</span>
      </div>

      <button
        type="submit"
        className="btn-velora w-100 justify-content-center"
        disabled={!stripe || processing}
        style={{ padding: '14px' }}
      >
        {processing ? (
          <div className="d-flex align-items-center gap-2">
            <div className="spinner-border spinner-border-sm" style={{ color: 'white' }}></div>
            Processing Payment...
          </div>
        ) : (
          <span>
            <i className="bi bi-lock me-2"></i>
            Pay {formatCurrency(amount)}
          </span>
        )}
      </button>
    </form>
  );
};

export default PaymentForm;
