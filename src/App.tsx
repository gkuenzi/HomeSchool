import { AppShell } from './components/AppShell';
import { PageFrame } from './components/PageFrame';

export function App() {
  return (
    <AppShell>
      <PageFrame
        title="Your learning workspace"
        description="The foundation for projects, pins, goals, and progress across your five categories."
      />
    </AppShell>
  );
}