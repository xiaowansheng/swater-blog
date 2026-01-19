import React from 'react'
import ReactDOM from 'react-dom/client'
import { AliveScope } from 'react-activation'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AliveScope>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </AliveScope>,
)

