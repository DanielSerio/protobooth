import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/');

// Test home route
export default function HomePage() {
  return <div>Home Page</div>;
}