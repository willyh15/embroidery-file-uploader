import { Toaster } from "react-hot-toast";

export function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '14px',
          padding: '12px 16px',
          boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.12)',
          animation: 'bounceIn 0.5s',
        },
        success: {
          duration: 5000,
          style: {
            background: '#dcfce7',
            color: '#166534',
            animation: 'bounceIn 0.5s',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#bbf7d0',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#fee2e2',
            color: '#991b1b',
            animation: 'shake 0.5s',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fecaca',
          },
        },
        loading: {
          duration: Infinity,
          style: {
            background: '#e0f2fe',
            color: '#0369a1',
            animation: 'pulse 1s infinite',
          },
        },
      }}
    />
  );
}