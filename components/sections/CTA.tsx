
interface CTAProps {
  content: {
    title?: string;
    buttonText?: string;
  };
}

export default function CTA({ content }: CTAProps) {
  return (
    <div className="my-16 p-12 bg-brand-600 rounded-3xl text-center text-white relative overflow-hidden shadow-2xl shadow-brand-500/30">
      <div className="relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white font-display">{content.title || 'Ready to get started?'}</h2>
        <button className="px-8 py-4 bg-white text-brand-600 font-bold rounded-2xl shadow-lg hover:bg-brand-50 transition-all transform hover:-translate-y-1 hover:shadow-xl">
          {content.buttonText || 'Get Started Now'}
        </button>
      </div>
    </div>
  );
}
