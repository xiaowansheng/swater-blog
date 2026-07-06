import { BrowserRouter } from 'react-router-dom'
import Router from './router'
import ErrorBoundary from './components/common/ErrorBoundary'
import LoginModal from './components/common/LoginModal'
import LoginExpiredModal from './components/common/LoginExpiredModal'
import { useAuthStore } from './store/auth'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

function App() {
  const { isLoginExpiredModalOpen, setLoginExpiredModalOpen } = useAuthStore()

  return (
    <ErrorBoundary>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#3b82f6', // modern sky blue
            borderRadius: 8,         // premium card/component roundness
            colorSuccess: '#10b981', // emerald green
            colorWarning: '#f59e0b', // amber yellow
            colorError: '#ef4444',   // coral red
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
          },
          components: {
            Button: {
              controlHeight: 38,
              borderRadius: 8,
            },
            Card: {
              boxShadow: '0 4px 20px -2px rgba(17, 24, 39, 0.04)',
            },
            Table: {
              headerBg: '#f9fafb',
              headerColor: '#374151',
            }
          }
        }}
      >
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Router />
          <LoginModal />
          <LoginExpiredModal
            open={isLoginExpiredModalOpen}
            onClose={() => setLoginExpiredModalOpen(false)}
          />
        </BrowserRouter>
      </ConfigProvider>
    </ErrorBoundary>
  )
}

export default App

