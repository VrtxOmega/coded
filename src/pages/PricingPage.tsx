import Footer from '@/sections/Footer';
import Pricing from '@/sections/Pricing';

export default function PricingPage() {
  return (
    <>
      <main className="site-page pricing-page">
        <section className="page-padding page-hero pricing-page-hero">
          <div className="max-w-7xl mx-auto">
            <span className="eyebrow">PRICING</span>
            <h1 className="text-h2 text-text-primary mt-4 mb-6">Keep ranking merit-based. Charge for leverage around it.</h1>
            <p className="text-body" style={{ color: '#B9BCC9', maxWidth: 780 }}>
              Builders can submit for free. Paid tiers unlock analytics, monitoring, distribution, and partner access without changing score position.
            </p>
          </div>
        </section>
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
