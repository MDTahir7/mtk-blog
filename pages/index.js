import Head from 'next/head';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mohammadtahirkhan.com/api';

function parseLocalDate(dateString) {
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
    const [year, month, day] = dateString.trim().split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(dateString);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function createPlainExcerpt(content, maxLength = 150) {
  if (!content) return '';
  const plain = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/^[#>*-]+\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}...`;
}

function normalizeTitle(title) {
  return String(title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export default function Home({ posts }) {
  return (
    <>
      <Head>
        <title>Mohammad Tahir Khan | Blogs</title>
        <meta
          name="description"
          content="Mohammad Tahir Khan's personal blog featuring curated movie vaults, articles, and recommendations."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Mohammad Tahir Khan | Blogs" />
        <meta
          property="og:description"
          content="Mohammad Tahir Khan's personal blog featuring curated movie vaults, articles, and recommendations."
        />
        <meta property="og:type" content="website" />
      </Head>

      <div className="hero">
        <div className="hero-wrapper">
          <div className="hero-block">
            <h1 className="hero-title">
              <span className="hero-title-text">
                <strong>mohammad tahir khan</strong>
                blogs
              </span>
            </h1>

            <ul className="gallery">
              {posts.map((post) => {
                const postDate = parseLocalDate(post.date);
                return (
                  <li key={post.slug} className="gallery-item">
                    <div className="card">
                      <div className="card-block">
                        <div className="card-element--date">
                          <div className="card-element-text--highlight">
                            {postDate.getDate()}
                          </div>
                          <div className="card-element-text">
                            {postDate.toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>
                      </div>
                      <div className="card-block card-block--primary">
                        <h2 className="card-title">{post.title}</h2>
                        <p className="card-subtitle">{post.excerpt}</p>
                      </div>
                      <div className="card-block card-block--secondary">
                        <Link href={`/blog/${post.slug}`} className="button button--primary">
                          READ
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const postsMap = new Map();

  // 1. Load local markdown files
  const postsDirectory = path.join(process.cwd(), 'posts');
  if (fs.existsSync(postsDirectory)) {
    const filenames = fs.readdirSync(postsDirectory).filter((name) => name.endsWith('.md'));
    for (const filename of filenames) {
      try {
        const filePath = path.join(postsDirectory, filename);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);
        const slug = filename.replace(/\.md$/, '');
        const title = data.title || 'Untitled';
        const normKey = normalizeTitle(title);

        postsMap.set(normKey, {
          title,
          slug,
          date: data.date ? String(data.date) : '2024-01-01',
          excerpt: data.excerpt || createPlainExcerpt(content),
        });
      } catch (e) {
        // skip malformed local file
      }
    }
  }

  // 2. Fetch from live API (mohammadtahirkhan.com/api/blogs)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE_URL}/blogs`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const apiBlogs = await res.json();
      if (Array.isArray(apiBlogs)) {
        for (const blog of apiBlogs) {
          if (blog.status && blog.status !== 'published') continue;
          const normKey = normalizeTitle(blog.title);
          const dateStr = blog.published_at || blog.created_at || '2024-01-01';
          postsMap.set(normKey, {
            title: blog.title || 'Untitled',
            slug: blog.slug,
            date: typeof dateStr === 'string' ? dateStr.slice(0, 10) : '2024-01-01',
            excerpt: blog.excerpt ? blog.excerpt.trim() : createPlainExcerpt(blog.content),
          });
        }
      }
    }
  } catch (err) {
    // API is offline or slow during build; fallback to local files without crashing
  }

  const posts = Array.from(postsMap.values()).sort(
    (a, b) => parseLocalDate(b.date) - parseLocalDate(a.date)
  );

  return {
    props: {
      posts,
    },
    revalidate: 60,
  };
}
