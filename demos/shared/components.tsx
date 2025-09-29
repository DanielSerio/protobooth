import React from 'react';

// Shared UI components for demo applications

export interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    joined: string;
  };
  router?: 'tanstack' | 'nextjs-app' | 'nextjs-pages';
}

export function UserCard({ user, router = 'tanstack' }: UserCardProps) {
  return (
    <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#6c757d',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px'
        }}>
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h2 style={{ margin: '0 0 5px 0' }}>{user.name}</h2>
          <p style={{ margin: '0', color: '#6c757d' }}>ID: {user.id}</p>
          <span style={{
            backgroundColor: user.role === 'admin' ? '#dc3545' : user.role === 'moderator' ? '#fd7e14' : '#28a745',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            textTransform: 'uppercase'
          }}>
            {user.role}
          </span>
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Joined:</strong> {user.joined}</p>
        <p><strong>Router:</strong> {router}</p>
      </div>
    </div>
  );
}

export interface ProductCardProps {
  product: {
    slug: string;
    name: string;
    price: number;
    description: string;
  };
  showLink?: boolean;
}

export function ProductCard({ product, showLink = true }: ProductCardProps) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>${product.price}</p>
      {showLink && (
        <div style={{ backgroundColor: '#007bff', color: 'white', padding: '8px 16px', textDecoration: 'none', borderRadius: '4px', display: 'inline-block' }}>
          View Details
        </div>
      )}
    </div>
  );
}

export interface DashboardStatsProps {
  stats?: {
    users?: number;
    projects?: number;
    reviews?: number;
    issues?: number;
  };
}

export function DashboardStats({ stats = { users: 1234, projects: 42, reviews: 7, issues: 3 } }: DashboardStatsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
      <div style={{ backgroundColor: '#007bff', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h3>Total Users</h3>
        <p style={{ fontSize: '24px', margin: '10px 0' }}>{stats.users}</p>
      </div>
      <div style={{ backgroundColor: '#28a745', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h3>Active Projects</h3>
        <p style={{ fontSize: '24px', margin: '10px 0' }}>{stats.projects}</p>
      </div>
      <div style={{ backgroundColor: '#ffc107', color: 'black', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h3>Pending Reviews</h3>
        <p style={{ fontSize: '24px', margin: '10px 0' }}>{stats.reviews}</p>
      </div>
      <div style={{ backgroundColor: '#dc3545', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h3>Issues</h3>
        <p style={{ fontSize: '24px', margin: '10px 0' }}>{stats.issues}</p>
      </div>
    </div>
  );
}

export interface FeatureFlagsDisplayProps {
  flags: Record<string, boolean>;
}

export function FeatureFlagsDisplay({ flags }: FeatureFlagsDisplayProps) {
  return (
    <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
      <h3>Feature Flags Status</h3>
      {Object.entries(flags).map(([flag, enabled]) => (
        <p key={flag}>
          {enabled ? '✅' : '❌'} <strong>{flag}:</strong> {enabled ? 'Enabled' : 'Disabled'}
        </p>
      ))}
    </div>
  );
}