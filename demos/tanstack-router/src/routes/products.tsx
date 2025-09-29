import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/products')({
  component: Products
});

function Products() {
  const products = [
    { slug: 'laptop', name: 'Gaming Laptop', price: 1299, description: 'High-performance gaming laptop' },
    { slug: 'mouse', name: 'Wireless Mouse', price: 79, description: 'Ergonomic wireless mouse' },
    { slug: 'keyboard', name: 'Mechanical Keyboard', price: 149, description: 'RGB mechanical keyboard' }
  ];

  return (
    <div>
      <h1>Products</h1>
      <p>Browse our collection of tech products. Click on any product to view details.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {products.map(product => (
          <div key={product.slug} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>${product.price}</p>
            <Link
              to="/product/$slug"
              params={{ slug: product.slug }}
              style={{ backgroundColor: '#007bff', color: 'white', padding: '8px 16px', textDecoration: 'none', borderRadius: '4px' }}
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}