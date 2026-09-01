import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props { children: ReactNode }
interface State { failed: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="fatal-error"><span>GC</span><h1>Something interrupted the service.</h1><p>Your locally saved bookings are safe. Reload to try again.</p><Button onClick={() => window.location.reload()}>Reload the application</Button></main>;
  }
}
