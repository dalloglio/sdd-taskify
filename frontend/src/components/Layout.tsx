import { ReactNode } from 'react';

type Props = {
  children?: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 p-4">
        <div className="app-container">Taskify</div>
      </header>
      <main className="flex-1 app-container p-4">{children}</main>
      <footer className="p-4 text-sm text-center text-muted-foreground">
        © Taskify
      </footer>
    </div>
  );
}
