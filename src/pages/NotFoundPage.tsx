import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import Footer from '@/sections/Footer';

export default function NotFoundPage() {
  return (
    <>
      <main className="site-page">
        <section className="page-padding page-hero">
          <div className="max-w-7xl mx-auto">
            <span className="eyebrow">404</span>
            <h1 className="text-h2 text-text-primary mt-4 mb-6">That page is not in the index.</h1>
            <p className="text-body" style={{ color: '#B9BCC9', maxWidth: 720 }}>
              The route does not match a Coded page. Jump back into rankings, collections, or repository intake.
            </p>
            <div className="project-actions">
              <Link className="btn-primary" to="/discover">Open rankings <ArrowRight size={16} /></Link>
              <Link className="btn-secondary" to="/submit">Submit a repo</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
