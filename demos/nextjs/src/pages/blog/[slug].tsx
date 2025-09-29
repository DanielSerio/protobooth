import { GetStaticProps, GetStaticPaths } from 'next';

interface BlogProps {
  post: {
    slug: string;
    title: string;
    author: string;
    content: string;
    publishedAt: string;
  } | null;
}

export default function BlogPost({ post }: BlogProps) {
  if (!post) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Blog Post Not Found</h1>
        <p>The requested blog post could not be found.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px' }}>
      <article>
        <header style={{ marginBottom: '30px' }}>
          <h1>{post.title}</h1>
          <div style={{ color: '#666', marginBottom: '10px' }}>
            <span>By {post.author}</span> • <span>{post.publishedAt}</span>
          </div>
          <div style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
            <strong>Route:</strong> /blog/[slug] (Pages Router with getStaticProps)
          </div>
        </header>

        <div style={{ lineHeight: '1.6' }}>
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index} style={{ marginBottom: '16px' }}>
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Mock blog posts matching our fixtures
  const slugs = ['getting-started', 'advanced-routing'];

  return {
    paths: slugs.map(slug => ({ params: { slug } })),
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const posts = {
    'getting-started': {
      slug: 'getting-started',
      title: 'Getting Started with Next.js',
      author: 'John Doe',
      publishedAt: 'March 15, 2024',
      content: `Welcome to our comprehensive guide on getting started with Next.js!\n\nNext.js is a powerful React framework that makes building full-stack web applications a breeze. It provides many features out of the box, including server-side rendering, static site generation, and automatic code splitting.\n\nIn this tutorial, we'll cover the basics of setting up a Next.js project, understanding the file structure, and building your first pages. Whether you're new to React or a seasoned developer, this guide will help you get up and running quickly.\n\nLet's dive in and explore what makes Next.js such a popular choice for modern web development!`
    },
    'advanced-routing': {
      slug: 'advanced-routing',
      title: 'Advanced Routing Patterns',
      author: 'Jane Smith',
      publishedAt: 'March 20, 2024',
      content: `Master advanced routing patterns in Next.js with this in-depth guide.\n\nRouting is one of Next.js's strongest features, offering both simplicity for basic use cases and power for complex applications. We'll explore dynamic routes, catch-all routes, and the new App Router.\n\nDynamic routes allow you to create pages that respond to URL parameters, while catch-all routes give you flexibility to handle nested paths. The App Router introduces new patterns for layouts, loading states, and error boundaries.\n\nBy the end of this article, you'll have a solid understanding of how to structure your Next.js application's routing for maximum flexibility and performance.`
    }
  };

  const post = posts[params?.slug as keyof typeof posts] || null;

  return {
    props: {
      post
    }
  };
};