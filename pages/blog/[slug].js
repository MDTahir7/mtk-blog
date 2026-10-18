import Head from 'next/head';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mohammadtahirkhan.com/api';

const SLUG_ALIASES = {
  'movie-recommendations': 'mohammad-tahir-khan-s-ultimate-movie-vault-part-1',
  'movie-recommendations2': 'mohammad-tahir-khan-s-ultimate-movie-vault-part-2',
  'mohammad-tahir-khan-s-ultimate-movie-vault-part-1': 'movie-recommendations',
  'mohammad-tahir-khan-s-ultimate-movie-vault-part-2': 'movie-recommendations2',
};

function parseLocalDate(dateString) {
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
    const [year, month, day] = dateString.trim().split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(dateString);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function sanitizePostHtml(rawHtml) {
  if (!rawHtml) return '';
  return rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*["']\s*javascript:[^"']*["']/gi, '$1="#"');
}

export default function BlogPost({ post }) {
  if (!post) return null;
  const postDate = parseLocalDate(post.date);

  return (
    <>
      <Head>
        <title>{`${post.title} | Mohammad Tahir Khan Blogs`}</title>
        <meta name="description" content={post.excerpt || post.title} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.title} />
        <meta property="og:type" content="article" />
      </Head>

      <div className="hero">
        <div className="hero-wrapper">
          <div className="hero-block">
            <h1 className="hero-title" style={{ fontSize: '32px', marginBottom: '40px' }}>
              <Link href="/" className="hero-title-text" style={{ cursor: 'pointer' }}>
                <strong>mohammad tahir khan</strong>
                blogs
              </Link>
            </h1>

            <article className="blog-post">
              <header className="blog-header">
                <h2 className="blog-title">{post.title}</h2>
                <div className="blog-meta">
                  <time className="blog-date" dateTime={post.date}>
                    {postDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              </header>

              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <footer className="blog-footer">
                <Link href="/" className="button button--primary">
                  ← Back to Blog
                </Link>
              </footer>
            </article>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const pathsSet = new Set();
  const postsDirectory = path.join(process.cwd(), 'posts');

  if (fs.existsSync(postsDirectory)) {
    const filenames = fs.readdirSync(postsDirectory).filter((name) => name.endsWith('.md'));
    for (const filename of filenames) {
      const slug = filename.replace(/\.md$/, '');
      pathsSet.add(slug);
      if (SLUG_ALIASES[slug]) pathsSet.add(SLUG_ALIASES[slug]);
    }
  }

  pathsSet.add('why-the-world-feels-less-interesting-as-we-grow-older');
  pathsSet.add('mohammad-tahir-khan-s-ultimate-movie-vault-part-1');
  pathsSet.add('mohammad-tahir-khan-s-ultimate-movie-vault-part-2');
  pathsSet.add('movie-recommendations');
  pathsSet.add('movie-recommendations2');

  const paths = Array.from(pathsSet).map((slug) => ({
    params: { slug },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const safeSlug = String(params?.slug || '').replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safeSlug) {
    return { notFound: true };
  }

  const postsDirectory = path.join(process.cwd(), 'posts');
  let postData = null;

  // 1. Try local file (check both slug and alias)
  const candidateFiles = [
    path.join(postsDirectory, `${safeSlug}.md`),
    SLUG_ALIASES[safeSlug] ? path.join(postsDirectory, `${SLUG_ALIASES[safeSlug]}.md`) : null,
  ].filter(Boolean);

  for (const filePath of candidateFiles) {
    if (fs.existsSync(filePath)) {
      try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);
        const htmlContent = sanitizePostHtml(marked.parse(content));
        postData = {
          ...data,
          slug: safeSlug,
          title: data.title || 'Untitled',
          date: data.date ? String(data.date) : '2024-01-01',
          excerpt: data.excerpt || '',
          content: htmlContent,
        };
        break;
      } catch (e) {
        // file reading error
      }
    }
  }

  // 2. Fallback to live API if not found locally
  if (!postData) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_BASE_URL}/blogs/slug/${encodeURIComponent(safeSlug)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const blog = await res.json();
        if (blog && blog.title) {
          const dateStr = blog.published_at || blog.created_at || '2024-01-01';
          const content = blog.content || '';
          const htmlContent = sanitizePostHtml(marked.parse(content));
          postData = {
            slug: blog.slug || safeSlug,
            title: blog.title,
            date: typeof dateStr === 'string' ? dateStr.slice(0, 10) : '2024-01-01',
            excerpt: blog.excerpt || '',
            content: htmlContent,
          };
        }
      }
    } catch (err) {
      // API request failed
    }
  }

  if (!postData) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post: postData,
    },
    revalidate: 60,
  };
}
