import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ marginBottom: '20px' }}>
        <Link to='/' style={{ marginRight: '10px' }}>
          Home
        </Link>
        <Link to='/about' style={{ marginRight: '10px' }}>
          About
        </Link>
        <Link to='/products' style={{ marginRight: '10px' }}>
          Products
        </Link>
        <Link
          to='/user/$userId'
          params={{ userId: '123' }}
          style={{ marginRight: '10px' }}>
          User Profile
        </Link>
        <Link to='/dashboard' style={{ marginRight: '10px' }}>
          Dashboard
        </Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  ),
});
