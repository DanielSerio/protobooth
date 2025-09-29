import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about');

// Test static route
export default function AboutPage() {
  return <div>About Page</div>;
}