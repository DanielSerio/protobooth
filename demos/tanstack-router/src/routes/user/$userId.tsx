import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/user/$userId')({
  component: UserProfile
});

function UserProfile() {
  const { userId } = Route.useParams();

  // Mock user data that matches our fixtures
  const userData = {
    '123': { name: 'John Doe', role: 'user', email: 'john@example.com', joined: '2023-01-15' },
    '456': { name: 'Jane Smith', role: 'admin', email: 'jane@example.com', joined: '2022-08-20' },
    '789': { name: 'Bob Wilson', role: 'moderator', email: 'bob@example.com', joined: '2023-03-10' }
  };

  const user = userData[userId as keyof typeof userData];

  if (!user) {
    return (
      <div>
        <h1>User Not Found</h1>
        <p>User with ID "{userId}" could not be found.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>User Profile</h1>
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#6c757d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 style={{ margin: '0 0 5px 0' }}>{user.name}</h2>
            <p style={{ margin: '0', color: '#6c757d' }}>ID: {userId}</p>
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
        </div>
      </div>
    </div>
  );
}