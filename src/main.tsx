import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/600.css';
import '@fontsource/merriweather/400.css';
import '@fontsource/merriweather/700.css';

import './index.css'


createRoot(document.getElementById("root")!).render(<App />);
