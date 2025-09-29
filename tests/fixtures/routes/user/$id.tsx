import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/user/$id');

// Test dynamic route
export default function UserPage() {
  return <div>User Page</div>;
}