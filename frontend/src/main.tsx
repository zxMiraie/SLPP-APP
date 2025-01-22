import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {BrowserRouter} from "react-router-dom"
import NavBar from "./components/NavBar.tsx";
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <NavBar />
         <App />
    </BrowserRouter>
  </StrictMode>,
)
