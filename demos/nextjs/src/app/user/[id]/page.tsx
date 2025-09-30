interface UserPageProps {
  params: {
    id: string;
  };
}

// Mock user data matching our fixtures
const userData = {
  '1': { id: '1', name: 'Alice Johnson', role: 'user', email: 'alice@example.com', joined: '2023-01-15' },
  '2': { id: '2', name: 'Bob Smith', role: 'admin', email: 'bob@example.com', joined: '2022-08-20' },
  '3': { id: '3', name: 'Carol Davis', role: 'moderator', email: 'carol@example.com', joined: '2023-03-10' }
};

export default function UserPage({ params }: UserPageProps) {
  const user = userData[params.id as keyof typeof userData];

  if (!user) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>User Not Found</h1>
        <p>User with ID {params.id} could not be found.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>User Profile (App Router)</h1>
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
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
          <p><strong>Router:</strong> App Router (Server Component)</p>
        </div>
      </div>
    </div>
  );
}