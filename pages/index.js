import { useState, useEffect } from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export default function Home({ posts }) {
  return (
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
            {posts.map((post, index) => (
              <li key={index} className="gallery-item">
                <div className="card">
                  <div className="card-block">
                    <div className="card-element--date">
                      <div className="card-element-text--highlight">
                        {new Date(post.date).getDate()}
                      </div>
                      <div className="card-element-text">
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                  </div>
                  <div className="card-block card-block--primary">
                    <h3 className="card-title">{post.title}</h3>
                    <p className="card-subtitle">{post.excerpt}</p>
                  </div>
                  <div className="card-block card-block--secondary">
                    <Link href={`/blog/${post.slug}`}>
                      <button className="button button--primary">READ</button>
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  
  // Create posts directory if it doesn't exist
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
  
  const filenames = fs.readdirSync(postsDirectory).filter(name => name.endsWith('.md'));
  
  const posts = filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      slug: filename.replace(/\.md$/, ''),
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      excerpt: data.excerpt || content.substring(0, 150) + '...',
      ...data
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return {
    props: {
      posts,
    },
  };
}