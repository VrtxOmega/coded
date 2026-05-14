import Footer from '@/sections/Footer';
import { rubric } from '@/data/coded';

export default function RubricPage() {
  return (
    <>
      <main className="site-page">
        <section className="page-padding page-hero">
          <div className="max-w-7xl mx-auto">
            <span className="eyebrow">RUBRIC</span>
            <h1 className="text-h2 text-text-primary mt-4 mb-6">Transparent grading builders can act on.</h1>
            <p className="text-body" style={{ color: '#B9BCC9', maxWidth: 780 }}>
              Coded should never feel like mysterious AI judgment. The rubric explains what is measured, how it affects rankings, and what maintainers can improve.
            </p>
          </div>
        </section>
        <section className="page-padding pb-28">
          <div className="max-w-7xl mx-auto rubric-grid">
            {rubric.map((item) => {
              const Icon = item.icon;
              return (
                <article className="rubric-card" key={item.title}>
                  <Icon size={24} />
                  <span>{item.weight}</span>
                  <h2>{item.title}</h2>
                  <p>{item.body}</p>
                </article>
              );
            })}
          </div>
          <div className="max-w-7xl mx-auto docs-panel">
            <h2>Score confidence</h2>
            <p>Projects enter top charts only when Coded has enough evidence. Missing builds, shallow docs, inactive maintainers, or unverified community activity lower confidence even when raw popularity is high.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

