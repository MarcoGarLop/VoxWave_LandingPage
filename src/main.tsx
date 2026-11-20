import { createRoot } from 'react-dom/client';
import './styles/global.css';
import { Deck } from './deck/Deck';

createRoot(document.getElementById('root')!).render(
  // No StrictMode: in development it would build the WebGL engine twice.
  <Deck />,
);
