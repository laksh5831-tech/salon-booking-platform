const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <nav className="d-flex justify-content-center mt-4">
      <ul className="pagination gap-1" style={{ border: 'none' }}>
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            className="page-link rounded-pill px-3"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ border: 'none', color: 'var(--velora-primary)' }}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
        </li>
        {pages.map((page, idx) => (
          <li key={idx} className={`page-item ${page === '...' ? 'disabled' : ''}`}>
            {page === '...' ? (
              <span className="page-link" style={{ border: 'none', color: 'var(--velora-muted)' }}>...</span>
            ) : (
              <button
                className={`page-link rounded-pill px-3 ${
                  page === currentPage ? 'text-white' : ''
                }`}
                onClick={() => onPageChange(page)}
                style={{
                  border: 'none',
                  background: page === currentPage ? 'var(--velora-primary)' : 'transparent',
                  color: page === currentPage ? 'white' : 'var(--velora-text)',
                  fontWeight: page === currentPage ? 600 : 400
                }}
              >
                {page}
              </button>
            )}
          </li>
        ))}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            className="page-link rounded-pill px-3"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ border: 'none', color: 'var(--velora-primary)' }}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
