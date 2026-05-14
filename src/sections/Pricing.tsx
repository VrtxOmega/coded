import { ArrowRight, Building2, ChartNoAxesCombined, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

const plans = [
  {
    icon: Sparkles,
    name: 'Builder',
    price: 'Free',
    body: 'Submit public projects, receive a scorecard, appear in rankings, and collect community reviews.',
    cta: 'Submit now',
  },
  {
    icon: ChartNoAxesCombined,
    name: 'Pro Profile',
    price: '$9/mo',
    body: 'Project analytics, score history, profile badge, launch scheduling, and deeper rubric recommendations.',
    cta: 'Join waitlist',
  },
  {
    icon: Building2,
    name: 'Partner',
    price: 'Custom',
    body: 'Sponsored collections, hiring feeds, category sponsorship, API access, and ecosystem discovery pages.',
    cta: 'Talk to us',
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative page-padding py-28 lg:py-40 section-band">
      <div className="max-w-7xl mx-auto">
        <div className="section-header">
          <span className="eyebrow">BUSINESS MODEL</span>
          <h2 className="text-h2 text-text-primary">Free discovery for builders. Paid leverage for serious distribution.</h2>
          <p className="text-body" style={{ color: '#9EA2B3' }}>
            The core ranking has to stay useful and merit-based. Monetization sits around analytics, promotion, and partner channels without selling the score.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <article className="pricing-card" key={plan.name}>
                <Icon size={24} />
                <h3>{plan.name}</h3>
                <strong>{plan.price}</strong>
                <p>{plan.body}</p>
                <Link to={plan.name === 'Partner' ? '/collections' : '/submit'}>
                  {plan.cta}
                  <ArrowRight size={16} />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
