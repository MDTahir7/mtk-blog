# Neon Blog - Next.js Cyberpunk Theme

A stunning cyberpunk-themed blog built with Next.js featuring neon glow effects and automatic markdown post generation.

## Features

- 🌟 **Neon glow effects** with CSS animations
- 📝 **Markdown support** for easy content creation
- 📱 **Responsive design** that works on all devices
- ⚡ **Automatic blog generation** from `.md` files
- 🎨 **Cyberpunk aesthetic** inspired by night club themes
- 🚀 **Next.js powered** for optimal performance

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Adding Blog Posts

To add a new blog post:

1. Create a new `.md` file in the `posts/` directory
2. Add frontmatter at the top of your file:

```yaml
---
title: "Your Post Title"
date: "2024-01-15"
excerpt: "A brief description of your post"
---
```

3. Write your content in Markdown below the frontmatter
4. The blog will automatically detect and display your new post

### Frontmatter Options

- `title` (required): The title of your blog post
- `date` (required): Publication date in YYYY-MM-DD format
- `excerpt` (optional): Brief description shown on the homepage

## Project Structure

```
├── pages/
│   ├── index.js          # Homepage with blog listing
│   ├── blog/
│   │   └── [slug].js     # Individual blog post pages
│   └── _app.js           # App component
├── posts/                # Your markdown blog posts
├── styles/
│   └── globals.css       # Global styles with neon theme
└── package.json
```

## Customization

### Changing Colors

Edit the CSS variables in `styles/globals.css`:

```css
:root {
  --brand-primary: #44D688;  /* Button color */
  --neon-effect: /* Neon glow colors */;
}
```

### Updating the Title

Modify the hero title in `pages/index.js` and `pages/blog/[slug].js`:

```jsx
<strong>your name here</strong>
blogs
```

## Technologies Used

- **Next.js** - React framework
- **React** - UI library
- **gray-matter** - Frontmatter parser
- **marked** - Markdown parser
- **CSS3** - Styling with neon effects

## License

MIT License - feel free to use this project for your own blog!

## Credits

Inspired by the neon club theme from [CodePen](https://codepen.io/hussard/pen/MdBKpv)

---

Enjoy creating amazing content with your new neon blog! ⚡