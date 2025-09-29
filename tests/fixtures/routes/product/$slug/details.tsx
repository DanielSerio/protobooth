import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/product/$slug/details');

// Test nested dynamic route
export default function ProductDetailsPage() {
  return <div>Product Details Page</div>;
}