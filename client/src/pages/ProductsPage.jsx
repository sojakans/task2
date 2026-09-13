import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/api';
import { ProductCard } from '../components/ProductCard';

const CATEGORIES = ['All', 'Microcontrollers', 'Sensors', 'Displays', 'Robotics'];

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialized from URL query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [availableOnly, setAvailableOnly] = useState(searchParams.get('available') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state if URL query params change externally
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: search.trim() || undefined,
        category: category !== 'All' ? category : undefined,
        minPrice: minPrice !== '' ? minPrice : undefined,
        maxPrice: maxPrice !== '' ? maxPrice : undefined,
        available: availableOnly ? 'true' : undefined,
        sort,
      };

      const data = await productService.getProducts(params);
      if (data.success) {
        setProducts(data.products);
        setTotalCount(data.total);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Unable to load components from backend. Ensure the server is online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, availableOnly, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setAvailableOnly(false);
    setSort('newest');
    setSearchParams({});
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--primary)',
            display: 'block',
            marginBottom: '0.25rem',
          }}>
            Discovery Engine
          </span>
          <h1 style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--slate-dark)',
          }}>
            Hardware Components Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Parametric search across microcontrollers, sensor packages, and robotics modules.
          </p>
        </div>

        {/* Filters & Control Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '2rem',
          alignItems: 'start',
        }}>
          {/* Left Sidebar Filter Panel */}
          <aside style={{
            background: 'var(--card)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>
                  filter_alt
                </span>
                Filters
              </h3>
              <button
                type="button"
                onClick={handleClearFilters}
                style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
              >
                Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-dark)', marginBottom: '0.625rem', display: 'block' }}>
                Category
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      fontWeight: category === cat ? 700 : 500,
                      background: category === cat ? 'var(--primary-subtle)' : 'transparent',
                      color: category === cat ? 'var(--primary)' : 'var(--slate-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span>{cat}</span>
                    {category === cat && (
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        check
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-dark)', marginBottom: '0.625rem', display: 'block' }}>
                Price Range (₹)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="number"
                  placeholder="Min"
                  className="input-field"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.8125rem' }}
                />
                <span style={{ color: 'var(--text-subtle)' }}>—</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="input-field"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.8125rem' }}
                />
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={fetchProducts}
                style={{ width: '100%', padding: '0.4rem', fontSize: '0.8125rem' }}
              >
                Apply Price
              </button>
            </div>

            {/* Availability Toggle */}
            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-hairline)' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--slate-dark)',
              }}>
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <main>
            {/* Top Toolbar */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.5rem',
              background: 'var(--card)',
              padding: '0.875rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-hairline)',
            }}>
              {/* Keyword Search */}
              <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '240px', display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Filter by keyword (e.g., ESP32, ARM, I2C)..."
                  className="input-field"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  Filter
                </button>
              </form>

              {/* Sort Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  Sort by:
                </span>
                <select
                  className="input-field"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  style={{ padding: '0.45rem 0.75rem', width: 'auto' }}
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="stock_desc">Highest Stock</option>
                </select>
              </div>
            </div>

            {/* Results Header Count */}
            <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Showing <strong>{products.length}</strong> of <strong>{totalCount}</strong> components
            </div>

            {/* Content States */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-hairline)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }}>
                  sync
                </span>
                <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>
                  Querying server inventory with parameters...
                </p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--stock-out-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--stock-out-border)', color: 'var(--stock-out-text)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>error</span>
                <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>{error}</p>
                <button onClick={fetchProducts} className="btn-secondary" style={{ marginTop: '1rem' }}>
                  Retry Query
                </button>
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-hairline)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-subtle)' }}>
                  search_off
                </span>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', marginTop: '0.75rem' }}>
                  No matching components found
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  Try adjusting your filter criteria, price bounds, or category selection.
                </p>
                <button onClick={handleClearFilters} className="btn-primary" style={{ marginTop: '1.25rem' }}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
