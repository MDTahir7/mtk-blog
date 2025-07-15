import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import Link from 'next/link';

export default function BlogPost({ post }) {
  return (
    <div className="hero">
      <div className="hero-wrapper">
        <div className="hero-block">
          <Link href="/">
            <h1 className="hero-title" style={{ fontSize: '32px', marginBottom: '40px', cursor: 'pointer' }}>
              <span className="hero-title-text">
                <strong>mohammad tahir khan</strong>
                blogs
              </span>
            </h1>
          </Link>
          
          <article className="blog-post">
            <header className="blog-header">
              <h1 className="blog-title">{post.title}</h1>
              <div className="blog-meta">
                <time className="blog-date">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </header>
            
            <div 
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            <footer className="blog-footer">
              <Link href="/">
                <button className="button button--primary">← Back to Blog</button>
              </Link>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  
  if (!fs.existsSync(postsDirectory)) {
    return {
      paths: [],
      fallback: false,
    };
  }
  
  const filenames = fs.readdirSync(postsDirectory).filter(name => name.endsWith('.md'));
  
  const paths = filenames.map((filename) => ({
    params: {
      slug: filename.replace(/\.md$/, ''),
    },
  }));
  
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const filePath = path.join(postsDirectory, `${params.slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return {
      notFound: true,
    };
  }
  
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  
  const htmlContent = marked(content);
  
  return {
    props: {
      post: {
        slug: params.slug,
        title: data.title || 'Untitled',
        date: data.date || new Date().toISOString(),
        content: htmlContent,
        ...data
      },
    },
  };
}