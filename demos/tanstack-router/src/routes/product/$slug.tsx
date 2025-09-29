import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/product/$slug')({
  component: Product
});

function Product() {
  const { slug } = Route.useParams();

  // In real app, this would fetch from API
  // For demo, we'll show mock data that matches our fixtures
  const productData = {
    laptop: { name: 'Gaming Laptop', price: 1299, description: 'High-performance gaming laptop with RTX graphics' },
    mouse: { name: 'Wireless Mouse', price: 79, description: 'Ergonomic wireless mouse with precision tracking' }
  };

  const product = productData[slug as keyof typeof productData];

  if (!product) {
    return (
      <div>
        <h1>Product Not Found</h1>
        <p>The product "{slug}" could not be found.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ backgroundColor: '#f0f0f0', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
            Product Image Placeholder
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h2>${product.price}</h2>
          <p>{product.description}</p>
          <button style={{ backgroundColor: '#28a745', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '4px', fontSize: '16px' }}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}