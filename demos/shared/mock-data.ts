// Shared mock data for consistent testing across demo applications

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  joined: string;
}

export interface MockProduct {
  slug: string;
  name: string;
  price: number;
  description: string;
}

export interface MockBlogPost {
  slug: string;
  title: string;
  author: string;
  publishedAt: string;
  content: string;
}

export const mockUsers: Record<string, MockUser> = {
  '1': { id: '1', name: 'Alice Johnson', role: 'user', email: 'alice@example.com', joined: '2023-01-15' },
  '123': { id: '123', name: 'John Doe', role: 'user', email: 'john@example.com', joined: '2023-01-15' },
  '2': { id: '2', name: 'Bob Smith', role: 'admin', email: 'bob@example.com', joined: '2022-08-20' },
  '456': { id: '456', name: 'Jane Smith', role: 'admin', email: 'jane@example.com', joined: '2022-08-20' },
  '3': { id: '3', name: 'Carol Davis', role: 'moderator', email: 'carol@example.com', joined: '2023-03-10' },
  '789': { id: '789', name: 'Bob Wilson', role: 'moderator', email: 'bob@example.com', joined: '2023-03-10' }
};

export const mockProducts: Record<string, MockProduct> = {
  'laptop': { slug: 'laptop', name: 'Gaming Laptop', price: 1299, description: 'High-performance gaming laptop with RTX graphics' },
  'mouse': { slug: 'mouse', name: 'Wireless Mouse', price: 79, description: 'Ergonomic wireless mouse with precision tracking' },
  'keyboard': { slug: 'keyboard', name: 'Mechanical Keyboard', price: 149, description: 'RGB mechanical keyboard with tactile switches' }
};

export const mockBlogPosts: Record<string, MockBlogPost> = {
  'getting-started': {
    slug: 'getting-started',
    title: 'Getting Started with Next.js',
    author: 'John Doe',
    publishedAt: 'March 15, 2024',
    content: 'Welcome to our comprehensive guide on getting started with Next.js!'
  },
  'advanced-routing': {
    slug: 'advanced-routing',
    title: 'Advanced Routing Patterns',
    author: 'Jane Smith',
    publishedAt: 'March 20, 2024',
    content: 'Master advanced routing patterns in Next.js with this in-depth guide.'
  }
};

export const mockAuthState = {
  user: { id: 1, name: 'Demo User', role: 'admin' },
  isAuthenticated: true,
  permissions: ['read', 'write', 'admin']
};

export const mockGlobalState = {
  theme: 'light',
  language: 'en',
  featureFlags: {
    newDashboard: true,
    betaFeatures: false,
    newLayout: true,
    experimentalFeatures: true
  }
};