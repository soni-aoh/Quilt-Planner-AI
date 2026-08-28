import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Bell, ChevronDown, FilePlus2, FolderOpen, Grid3X3, Library, Menu, Settings2, Sparkles, X } from 'lucide-react';

const links = [
  { href: '/', label: 'Overview', icon: Grid3X3 },
  { href: '/fabrics', label: 'Fabric library', icon: Library },
  { href: '/design', label: 'Design assistant', icon: Sparkles },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[246px] flex-col bg-sidebar px-5 py-6 text-sidebar-foreground transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
              <span className="grid grid-cols-2 gap-0.5">
                <i className="h-2.5 w-2.5 rounded-sm bg-[#d87962]" /><i className="h-2.5 w-2.5 rounded-sm bg-[#73958a]" />
                <i className="h-2.5 w-2.5 rounded-sm bg-[#e9bd72]" /><i className="h-2.5 w-2.5 rounded-sm bg-sidebar-primary-foreground/70" />
              </span>
            </span>
            <span>
              <span className="block font-display text-[20px] leading-none tracking-[-.02em]">Quiltwise</span>
              <span className="mt-1 block font-mono-app text-[9px] uppercase tracking-[.18em] text-sidebar-foreground/55">planning studio</span>
            </span>
          </Link>
          <button className="rounded-lg p-2 hover:bg-sidebar-accent md:hidden" onClick={() => setMobileOpen(false)} data-testid="button-close-menu"><X size={18} /></button>
        </div>
        <div className="mt-12">
          <p className="mb-3 px-3 font-mono-app text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/45">Workspace</p>
          <nav className="space-y-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${location === href ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`}>
                <Icon size={17} strokeWidth={1.7} /><span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between px-3">
            <p className="font-mono-app text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/45">Projects</p>
            <Link href="/projects/new" className="rounded-md p-1 text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-primary" data-testid="link-new-project"><FilePlus2 size={15} /></Link>
          </div>
          <Link href="/projects/new" className="flex items-center gap-3 rounded-xl border border-dashed border-sidebar-border px-3 py-3 text-[12px] text-sidebar-foreground/58 hover:border-sidebar-primary/60 hover:text-sidebar-foreground" data-testid="link-start-project">
            <FolderOpen size={16} /><span>Start a new quilt</span>
          </Link>
        </div>
        <div className="mt-auto border-t border-sidebar-border pt-4">
          <Link href="/settings" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] ${location === '/settings' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent'}`} data-testid="link-settings"><Settings2 size={17} /><span>Studio settings</span></Link>
          <button className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-sidebar-accent" onClick={() => setNoticeOpen((value) => !value)} data-testid="button-profile">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d87962] font-mono-app text-[11px] text-white">MW</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-[12px]">Mara Wilson</span><span className="block text-[10px] text-sidebar-foreground/45">Personal studio</span></span>
            <ChevronDown size={14} className="text-sidebar-foreground/50" />
          </button>
          {noticeOpen && <div className="mt-2 rounded-lg border border-sidebar-border bg-sidebar-accent p-3 text-[11px] text-sidebar-foreground/75">Your studio is private and autosaves as you work.</div>}
        </div>
      </aside>
      {mobileOpen && <button className="fixed inset-0 z-30 bg-foreground/20 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-dismiss-menu" />}
      <main className="md:pl-[246px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur-md md:px-10">
          <button className="rounded-lg p-2 hover:bg-muted md:hidden" onClick={() => setMobileOpen(true)} data-testid="button-open-menu"><Menu size={20} /></button>
          <div className="hidden items-center gap-2 text-[12px] text-muted-foreground md:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#73958a]" /> Studio ready</div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setNoticeOpen((value) => !value)} data-testid="button-notifications"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" /></button>
            <Link href="/projects/new" className="ml-2 hidden items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[12px] font-medium text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 sm:flex" data-testid="link-header-new-project"><FilePlus2 size={15} /> New project</Link>
          </div>
          {noticeOpen && <div className="absolute right-5 top-16 w-64 rounded-xl border border-border bg-card p-4 text-xs shadow-lg md:right-10"><p className="font-medium">Nothing new to review</p><p className="mt-1 text-muted-foreground">Your latest plan is safely saved.</p></div>}
        </header>
        {children}
      </main>
    </div>
  );
}