interface HeaderProps {
  onFocusNameInput: () => void;
}

export function Header({ onFocusNameInput }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#FAFAFA]/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          Nomen
        </a>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <a
            href="#request-name"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Request Name
          </a>
          <a
            href="#badge-preview"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Live Pass
          </a>
          <a
            href="#registry-directory"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Directory
          </a>
          <a
            href="#guidelines"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Standards
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onFocusNameInput}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Enter Your Name
          </button>
        </div>
      </div>
    </header>
  );
}
