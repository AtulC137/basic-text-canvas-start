
const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center space-y-6 max-w-2xl px-6">
        <h1 className="text-5xl font-bold text-slate-800 tracking-tight">
          Welcome
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          Your project is ready to go. Start building something amazing!
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
          <span>Built with</span>
          <span className="font-semibold text-slate-700">React</span>
          <span>•</span>
          <span className="font-semibold text-slate-700">TypeScript</span>
          <span>•</span>
          <span className="font-semibold text-slate-700">Tailwind CSS</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
