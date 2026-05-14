import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import Footer from '@/sections/Footer';
import { collections } from '@/data/coded';

export default function CollectionsPage() {
  return (
    <>
      <main className="site-page">
        <section className="page-padding page-hero">
          <div className="max-w-7xl mx-auto">
            <span className="eyebrow">COLLECTIONS</span>
            <h1 className="text-h2 text-text-primary mt-4 mb-6">Curated maps through fast-moving software categories.</h1>
            <p className="text-body" style={{ color: '#B9BCC9', maxWidth: 780 }}>
              Collections package scorecards into useful contexts: what to try, what is production-ready, what is rising, and what deserves sponsorship.
            </p>
          </div>
        </section>
        <section className="page-padding pb-28">
          <div className="max-w-7xl mx-auto collection-grid">
            {collections.map((collection) => {
              const Icon = collection.icon;
              return (
                <article className="collection-card" key={collection.title}>
                  <Icon size={24} />
                  <h2>{collection.title}</h2>
                  <p>{collection.body}</p>
                  <span>{collection.count} projects</span>
                  <Link to="/discover">Browse collection <ArrowRight size={16} /></Link>
                </article>
              );
            })}
          </div>
          <div className="max-w-7xl mx-auto sponsored-strip">
            <div>
              <span className="eyebrow">PARTNER CHANNELS</span>
              <h2>Useful sponsorship without selling ranking position.</h2>
            </div>
            <Link className="btn-primary" to="/submit">Submit for a collection</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
