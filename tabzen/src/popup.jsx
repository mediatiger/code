import React from 'react';
import { createRoot } from 'react-dom/client';
import PopupApp from './components/PopupApp';
import './index.css';

createRoot(document.getElementById('popup-root')).render(<PopupApp />);
