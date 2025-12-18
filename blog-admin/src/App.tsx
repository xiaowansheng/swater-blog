import { BrowserRouter } from 'react-router-dom'
import Router from './router'
import ErrorBoundary from './components/common/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App

