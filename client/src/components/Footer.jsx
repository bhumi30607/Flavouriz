import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart, Code2, BookOpen, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-green text-cream border-t border-forest-green-light mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-forest-green shadow-soft">
                <UtensilsCrossed className="w-5 h-5 text-terracotta" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Flavouriz
              </span>
            </Link>
            <p className="text-sm text-cream/70 leading-relaxed">
              A community-driven recipe sharing platform celebrating kitchen creativity, diverse culinary traditions, and honest food reviews.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-green-light/60 border border-forest-green-light text-xs text-cream/90">
              <Code2 className="w-3.5 h-3.5 text-terracotta" />
              <span>Academic Full-Stack Syllabus Project</span>
            </div>
          </div>

          {/* Explore Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-white">Explore</h4>
            <ul className="space-y-2 text-sm text-cream/80">
              <li>
                <Link to="/explore" className="hover:text-terracotta transition-colors">
                  All Recipes
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Breakfast" className="hover:text-terracotta transition-colors">
                  Breakfast & Brunch
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Dinner" className="hover:text-terracotta transition-colors">
                  Dinner Classics
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Desserts" className="hover:text-terracotta transition-colors">
                  Artisan Desserts
                </Link>
              </li>
              <li>
                <Link to="/explore?difficulty=Easy" className="hover:text-terracotta transition-colors">
                  Quick 15-Min Meals
                </Link>
              </li>
            </ul>
          </div>

          {/* Syllabus Modules
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-white">Syllabus Coverage</h4>
            <ul className="space-y-2 text-xs text-cream/70">
              <li className="flex items-start gap-2">
                <span className="text-terracotta font-bold">•</span>
                <span><strong>Module 1:</strong> Semantic HTML5, CSS3, ES6+, Fetch API</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terracotta font-bold">•</span>
                <span><strong>Module 2:</strong> Node.js Core, fs/promises, Streams, Events</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terracotta font-bold">•</span>
                <span><strong>Module 3:</strong> React, Tailwind CSS, Responsive UI</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terracotta font-bold">•</span>
                <span><strong>Module 4:</strong> Express REST API, JWT, Multer Uploads</span>
              </li>
            </ul>
          </div> */}

          {/* Platform & Persistence */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-white">Architecture</h4>
            <p className="text-xs text-cream/70 leading-relaxed">
              Built strictly without external databases using Node.js core <code className="bg-forest-green-dark px-1.5 py-0.5 rounded text-terracotta-light">fs</code> and <code className="bg-forest-green-dark px-1.5 py-0.5 rounded text-terracotta-light">path</code> JSON-file persistence with atomic write queues.
            </p>
            <div className="pt-2 text-xs text-cream/60 flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Bcrypt Salted Password Security
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-terracotta" />
                RESTful CRUD with HTTP Status Codes
              </span>
            </div>
          </div>

        </div>

        <div className="border-t border-forest-green-light mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-cream/60 gap-4">
          <p>© {new Date().getFullYear()} Flavouriz Platform. Prescribed College Curriculum Web Dev Project.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-terracotta fill-terracotta" /> for foodies & code learners
          </p>
        </div>
      </div>
    </footer>
  );
}
