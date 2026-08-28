import { useState } from 'react';
import toast from 'react-hot-toast';
import paymentService from '../../services/paymentService';
import { formatCurrency } from '../../utils/helpers';

const DemoPaymentForm = ({ amount, clientSecret, onSuccess, onError }) => {
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    await new Promise(res => setTimeout(res, 1200));

    try {
      await paymentService.confirmPayment(clientSecret);
      toast.success('Payment successful!');
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
      if (onError) onError(err);
    } finally {
      setProcessing(false);
    }
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
          padding: '14px',
          background: '#fff'
        }}>
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-credit-card fs-3" style={{ color: 'var(--velora-primary)' }}></i>
            <div className="flex-grow-1">
              <div className="fw-semibold" style={{ fontSize: '0.95rem' }}>4242 4242 4242 4242</div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>VISA • Demo test card • Exp 12/34 • CVC 123</div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 mb-3 p-2 rounded-3" style={{
        fontSize: '0.8rem', color: 'var(--velora-muted)', background: 'var(--velora-bg)'
      }}>
        <i className="bi bi-shield-check" style={{ color: 'var(--velora-success)' }}></i>
        <span>Demo payment mode — no real money is moved. Add Stripe keys to go live.</span>
      </div>

      <button
        type="submit"
        className="btn-velora w-100 justify-content-center"
        disabled={processing}
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

export default DemoPaymentForm;