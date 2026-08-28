import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import salonService from '../../services/salonService';
import SalonCard from '../../components/salon/SalonCard';
import { SkeletonSalonCard } from '../../components/common/Skeleton';
import { EmptyState, ErrorState } from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const SalonListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [sortBy, setSortBy] = useState('-rating');

  const fetchSalons = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await salonService.getSalons({
        page,
        limit: 9,
        search: search || undefined,
        city: city || undefined,
        sort: sortBy
      });
      setSalons(res.data.data.salons);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError('Failed to load salons. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, city, sortBy]);

  useEffect(() => {
    fetchSalons(1);
  }, [fetchSalons]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (city) params.city = city;
    setSearchParams(params, { replace: true });
    fetchSalons(1);
  };

  return (
    <>
      <Helmet>
        <title>Discover Salons - Velora</title>
        <meta name="description" content="Find and book appointments at premium salons near you." />
      </Helmet>

      <section style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.05) 0%, rgba(236,72,153,0.05) 100%)',
        padding: '40px 0'
      }}>
        <div className="container">
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--velora-dark)' }}>
            Discover Salons
          </h2>
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-5">
                <div className="position-relative">
                  <i className="bi bi-search position-absolute" style={{ left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--velora-muted)' }}></i>
                  <input
                    type="text"
                    className="input-velora ps-5"
                    placeholder="Search salons by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <div className="position-relative">
                  <i className="bi bi-geo-alt position-absolute" style={{ left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--velora-muted)' }}></i>
                  <input
                    type="text"
                    className="input-velora ps-5"
                    placeholder="Filter by city..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="input-velora"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="-rating">Top Rated</option>
                  <option value="name">Name A-Z</option>
                  <option value="-name">Name Z-A</option>
                  <option value="-createdAt">Newest</option>
                </select>
              </div>
              <div className="col-md-1">
                <button type="submit" className="btn-velora w-100 justify-content-center">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="page-section" style={{ paddingTop: 20 }}>
        <div className="container">
          {error && <ErrorState message={error} onRetry={() => fetchSalons(1)} />}

          {loading ? (
            <div className="row g-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="col-lg-4 col-md-6">
                  <SkeletonSalonCard />
                </div>
              ))}
            </div>
          ) : salons.length === 0 ? (
            <EmptyState
              icon="bi-search"
              title="No salons found"
              message="Try adjusting your search filters to find what you're looking for."
            />
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <p className="text-muted mb-0">
                  Showing {salons.length} salon{salons.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="row g-4">
                {salons.map(salon => (
                  <div key={salon._id} className="col-lg-4 col-md-6">
                    <SalonCard salon={salon} />
                  </div>
                ))}
              </div>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={fetchSalons}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default SalonListPage;
