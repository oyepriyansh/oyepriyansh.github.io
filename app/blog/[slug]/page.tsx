import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cabin, epilogue } from '../../utils/fonts';
import { 
  containerStyles,
  BackButton,
  textStyles,
  Footer
} from '../../components/ui';
import { getPostBySlug, getAllPostSlugs } from '../../../lib/posts';
import { generateArticleJsonLd, generateBreadcrumbJsonLd } from '../../../lib/structured-data';
import HeadingAnchor from '../../components/HeadingAnchor';
import ScrollToAnchor from '../../components/ScrollToAnchor';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  const publishedTime = new Date(post.date).toISOString();
  const modifiedTime = new Date(post.date).toISOString();

  return {
    title: post.title,
    description: post.excerpt,
    keywords: [...post.tags, "Priyansh Prajapat", "Blog", "Programming", "Web Development"],
    authors: [{ name: "Priyansh Prajapat", url: "https://oyepriyansh.github.io" }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://oyepriyansh.github.io/blog/${slug}`,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: ['Priyansh Prajapat'],
      tags: post.tags,
      images: [
        {
          url: '/oyepriyansh.webp',
          width: 630,
          height: 630,
          alt: post.title,
        }
      ],
    },
    twitter: {
      title: post.title,
      description: post.excerpt,
      creator: '@oyepriyansh',
    },
    alternates: {
      canonical: `https://oyepriyansh.github.io/blog/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPostSlugs();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }

  const articleJsonLd = generateArticleJsonLd(post, slug);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: 'https://oyepriyansh.github.io' },
    { name: 'Blog', url: 'https://oyepriyansh.github.io/blog' },
    { name: post.title, url: `https://oyepriyansh.github.io/blog/${slug}` }
  ]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const mdxComponents = {
    h1: ({ children }: { children: React.ReactNode }) => (
      <HeadingAnchor level={1} className={`text-3xl md:text-4xl font-bold mb-6 text-white ${cabin.className}`}>
        {children}
      </HeadingAnchor>
    ),
    h2: ({ children }: { children: React.ReactNode }) => (
      <HeadingAnchor level={2} className={`text-2xl md:text-3xl font-semibold mb-4 mt-8 text-white ${cabin.className}`}>
        {children}
      </HeadingAnchor>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <HeadingAnchor level={3} className={`text-xl md:text-2xl font-medium mb-3 mt-6 text-white ${cabin.className}`}>
        {children}
      </HeadingAnchor>
    ),
    p: ({ children }: { children: React.ReactNode }) => (
      <p className={`${textStyles.paragraph} mb-4 leading-relaxed`}>
        {children}
      </p>
    ),
    code: ({ className, children }: { className?: string; children: React.ReactNode }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (language) {
        return (
          <SyntaxHighlighter
            style={oneDark}
            language={language}
            PreTag="div"
            className="rounded-lg mb-6 text-sm"
            customStyle={{
              margin: 0,
              background: '#1a1a1a',
              border: '1px solid #374151',
            }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }
      
      return (
        <code className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-md text-sm">
          {children}
        </code>
      );
    },
    pre: ({ children }: { children: React.ReactNode }) => {
      return <>{children}</>;
    },
    a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
      <a 
        href={href} 
        className="text-purple-400 hover:text-purple-300 transition-colors underline"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc mb-4 space-y-2 text-gray-300 ml-4 sm:ml-6 pl-2 sm:pl-4">
        {children}
      </ul>
    ),
    ol: ({ children }: { children: React.ReactNode }) => (
      <ol className="list-decimal mb-4 space-y-2 text-gray-300 ml-4 sm:ml-6 pl-2 sm:pl-4">
        {children}
      </ol>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
      <li className="mb-2 leading-relaxed">
        {children}
      </li>
    ),
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-purple-500 pl-4 mb-6 italic text-gray-300">
        {children}
      </blockquote>
    ),
  };

  return (
    <>
      <ScrollToAnchor />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className={containerStyles.main}>
      <div className="mx-auto max-w-3xl px-4 mt-10 text-white">
        <div className="flex items-center justify-between mb-6">
          <BackButton href="/blog" text="Back to Blog" />
        </div>

  <article className={`${containerStyles.card} p-6 mb-8`}>
          <header className="mb-8">
            <h1 className={`text-3xl md:text-4xl font-bold mb-3 text-white ${cabin.className}`}>
              {post.title}
            </h1>
            
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10 ${epilogue.className}`}>
              <div className="flex items-center text-sm text-gray-400">
                <time dateTime={post.date} className="mr-3">
                  {formatDate(post.date)}
                </time>
                <span className="mr-3">•</span>
                <span>{post.readTime}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 text-xs bg-purple-600/20 text-purple-300 rounded-full border border-purple-600/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </header>

          <div className="prose prose-invert max-w-none">
            <MDXRemote source={post.content} components={mdxComponents} />
          </div>
        </article>

        <footer className="mt-12 pt-6 border-t border-white/10 text-center">
          <Footer />
        </footer>
      </div>
    </div>
    </>
  );
}