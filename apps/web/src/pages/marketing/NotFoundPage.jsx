import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found - Velora</title>
      </Helmet>
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style={{
          width: 100, height: 100,
          background: 'rgba(124,58,237,0.08)',
          color: 'var(--velora-primary)',
          fontSize: '3rem'
        }}>
          <i className="bi bi-question-circle"></i>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'var(--velora-dark)' }}>404</h1>
        <h3 className="mb-3" style={{ fontFamily: 'var(--font-display)' }}>Page Not Found</h3>
        <p className="text-muted mb-4" style={{ maxWidth: 400, margin: '0 auto' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-velora">
          <i className="bi bi-house"></i> Back to Home
        </Link>
      </div>
    </>
  );
};

export default NotFoundPage;
