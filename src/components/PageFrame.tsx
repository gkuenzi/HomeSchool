import type { ReactNode } from 'react';

interface PageFrameProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function PageFrame({ title, description, children }: PageFrameProps) {
  return (
    <section className="page-frame">
      <header className="page-header">
        <p className="page-eyebrow">Workspace</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
    </section>
  );
}