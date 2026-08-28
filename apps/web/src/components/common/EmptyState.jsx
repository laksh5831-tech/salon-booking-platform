const EmptyState = ({ icon = 'bi-inbox', title, message, action, actionLabel, onAction }) => (
  <div className="text-center py-5 px-3">
    <div
      className="d-inline-flex align-items-center justify-content-center mb-4 rounded-circle"
      style={{
        width: 80,
        height: 80,
        background: 'rgba(124, 58, 237, 0.08)',
        color: 'var(--velora-primary)',
        fontSize: '2rem'
      }}
    >
      <i className={`bi ${icon}`}></i>
    </div>
    <h5 style={{ fontFamily: 'var(--font-display)', color: 'var(--velora-dark)' }}>
      {title}
    </h5>
    {message && (
      <p className="text-muted mx-auto" style={{ maxWidth: 400 }}>
        {message}
      </p>
    )}
    {action && (
      <button className="btn-velora mt-3" onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <EmptyState
    icon bi-exclamation-triangle
    title="Oops!"
    message={message}
    action={!!onRetry}
    actionLabel="Try Again"
    onAction={onRetry}
  />
);

const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="d-flex flex-column align-items-center justify-content-center py-5">
    <div className="spinner-border mb-3" style={{ color: 'var(--velora-primary)', width: 40, height: 40 }}>
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="text-muted mb-0">{text}</p>
  </div>
);

export { EmptyState, ErrorState, LoadingSpinner };
