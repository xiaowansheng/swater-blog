import { BrowserRouter } from 'react-router-dom'
import Router from './router'
import ErrorBoundary from './components/common/ErrorBoundary'
import LoginModal from './components/common/LoginModal'
import LoginExpiredModal from './components/common/LoginExpiredModal'
import { useAuthStore } from './store/auth'

function App() {
  const { isLoginExpiredModalOpen, setLoginExpiredModalOpen } = useAuthStore()

  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Router />
        <LoginModal />
        <LoginExpiredModal
          open={isLoginExpiredModalOpen}
          onClose={() => setLoginExpiredModalOpen(false)}
        />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App

