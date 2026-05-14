import { Bot, Boxes, FileCheck2, Github, Rocket, SearchCheck } from 'lucide-react';

const steps = [
  {
    icon: Github,
    title: 'Submit the repo',
    body: 'Connect GitHub, pick a public repository, add the demo URL, and choose a category. No pitch deck required.',
  },
  {
    icon: Boxes,
    title: 'Run the build',
    body: 'Coded clones the project, checks install instructions, runs tests where available, and records reproducibility evidence.',
  },
  {
    icon: Bot,
    title: 'Grade the work',
    body: 'AI reviews code quality, docs, security posture, architecture, originality, and presentation against a transparent rubric.',
  },
  {
    icon: SearchCheck,
    title: 'Publish the scorecard',
    body: 'Every project gets a shareable page with strengths, risks, setup notes, review prompts, and ranking history.',
  },
  {
    icon: FileCheck2,
    title: 'Collect verified reviews',
    body: 'GitHub-linked reviewers rate usefulness and adoption intent. Helpful reviews improve weight; drive-by voting does not.',
  },
  {
    icon: Rocket,
    title: 'Earn distribution',
    body: 'Top projects surface in trending feeds, category boards, collection pages, newsletters, and API-powered partner directories.',
  },
];

export default function Workflow() {
  return (
    <section id="workflow" className="relative page-padding py-28 lg:py-40 section-band">
      <div className="max-w-7xl mx-auto">
        <div className="section-header">
          <span className="eyebrow">FROM REPO TO RANKING</span>
          <h2 className="text-h2 text-text-primary">A launch flow built for builders who already shipped.</h2>
          <p className="text-body" style={{ color: '#9EA2B3' }}>
            The platform should feel like CI for discoverability: clear inputs, observable checks, a score you can improve, and distribution when the project deserves it.
          </p>
        </div>

        <div className="workflow-grid">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article className="workflow-step" key={step.title}>
                <div className="workflow-index">{String(index + 1).padStart(2, '0')}</div>
                <Icon size={22} />
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

