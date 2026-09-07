import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { InterviewProvider } from './context/InterviewContext';
import { SkillProvider } from './context/SkillContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <InterviewProvider>
          <SkillProvider>
            <App />
          </SkillProvider>
        </InterviewProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
