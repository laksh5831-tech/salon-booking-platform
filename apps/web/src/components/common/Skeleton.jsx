const SkeletonCard = ({ height = 200 }) => (
  <div className="card-velora overflow-hidden">
    <div className="skeleton" style={{ height, width: '100%' }}></div>
    <div className="p-3">
      <div className="skeleton mb-2" style={{ height: 20, width: '70%' }}></div>
      <div className="skeleton mb-2" style={{ height: 14, width: '50%' }}></div>
      <div className="skeleton" style={{ height: 14, width: '40%' }}></div>
    </div>
  </div>
);

const SkeletonSalonCard = () => (
  <div className="card-velora overflow-hidden">
    <div className="skeleton" style={{ height: 200, width: '100%' }}></div>
    <div className="p-3">
      <div className="d-flex align-items-center gap-2 mb-2">
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }}></div>
        <div>
          <div className="skeleton mb-1" style={{ height: 18, width: 160 }}></div>
          <div className="skeleton" style={{ height: 12, width: 100 }}></div>
        </div>
      </div>
      <div className="skeleton mb-2" style={{ height: 14, width: '90%' }}></div>
      <div className="skeleton mb-2" style={{ height: 14, width: '60%' }}></div>
      <div className="d-flex gap-2 mt-3">
        <div className="skeleton" style={{ height: 28, width: 80, borderRadius: 9999 }}></div>
        <div className="skeleton" style={{ height: 28, width: 80, borderRadius: 9999 }}></div>
      </div>
    </div>
  </div>
);

const SkeletonProfile = () => (
  <div className="d-flex align-items-center gap-3">
    <div className="skeleton" style={{ width: 50, height: 50, borderRadius: '50%' }}></div>
    <div>
      <div className="skeleton mb-1" style={{ height: 16, width: 140 }}></div>
      <div className="skeleton" style={{ height: 12, width: 100 }}></div>
    </div>
  </div>
);

const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="card-velora">
    <div className="p-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="d-flex gap-3 mb-3">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton" style={{ height: 16, flex: 1 }}></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export { SkeletonCard, SkeletonSalonCard, SkeletonProfile, SkeletonTable };
