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
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        },
        success: {
          style: {
            background: '#dcfce7',
            color: '#166534',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#bbf7d0',
          },
        },
        error: {
          style: {
            background: '#fee2e2',
            color: '#991b1b',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fecaca',
          },
        },
        loading: {
          style: {
            background: '#e0f2fe',
            color: '#0369a1',
          },
        },
      }}
    />
  );
}