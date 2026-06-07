import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="legacy-card p-10 text-center max-w-md">
            <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <i className="fas fa-exclamation-triangle text-red-500 text-3xl" />
            </div>
            <h1 className="text-2xl font-display font-black text-white uppercase tracking-tighter mb-4">
              Ops! Algo deu errado.
            </h1>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Ocorreu um erro inesperado na aplicação. Tente recarregar a página ou voltar mais tarde.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="legacy-btn w-full"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
