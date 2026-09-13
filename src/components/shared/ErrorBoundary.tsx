import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }

  override render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
        <h1 className="font-display text-4xl">This page didn't load</h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          Something went wrong on our end. Try again, or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => this.setState({ error: null })}
            className="label-xs bg-charcoal px-6 py-3 text-ivory"
          >
            Try again
          </button>
          <a href="/" className="label-xs border border-border px-6 py-3">
            Go home
          </a>
        </div>
      </div>
    );
  }
}
