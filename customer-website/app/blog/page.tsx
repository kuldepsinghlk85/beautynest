'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, Clock, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  const posts = [
    {
      title: '7 Secrets to Achieving Korean Glass Skin at Home',
      slug: 'korean-glass-skin-secrets',
      date: 'Aug 2026',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1512290900672-1f41444e2fc1?w=600&q=80',
      excerpt: 'Discover why hyaluronic acid layering, chilled jade rolling, and double cleansing have transformed modern doorstep facial rituals.',
      tag: 'Skincare',
    },
    {
      title: 'Painless Waxing Guide: Why Cartridge Wax Outperforms Hot Pot Wax',
      slug: 'painless-waxing-guide',
      date: 'Jul 2026',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
      excerpt: 'Say goodbye to burns, cross-contamination, and skin peeling with single-use hygienic cartridge waxing technology.',
      tag: 'Hygiene & Care',
    },
    {
      title: 'The Ultimate 30-Day Pre-Bridal Beauty Checklist for Lucknow Brides',
      slug: 'pre-bridal-beauty-checklist',
      date: 'Jun 2026',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80',
      excerpt: 'From body polishing and hair keratin treatments to HD trial makeup sessions, here is your stress-free wedding prep timeline.',
      tag: 'Bridal',
    },
  ];

  return (
    <div className="py-12 bg-brand-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-pink-100 px-3 py-1 rounded-full">
            BEAUTY EDITORIAL
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-charcoal mt-3">
            Beauty &amp; Skincare Journal
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Expert beauty rituals, hygiene guides, and doorstep wellness tips curated by master aesthetic practitioners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-3xl overflow-hidden border border-pink-100 shadow-sm hover:shadow-pink-soft transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-pink-50">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-brand-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                    {post.tag}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-primary transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary group-hover:translate-x-1 transition-transform"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
}
