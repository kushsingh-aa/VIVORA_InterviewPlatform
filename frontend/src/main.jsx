import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { InterviewProvider } from './context/InterviewContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <InterviewProvider>
          <App />
        </InterviewProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
