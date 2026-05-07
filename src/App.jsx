import './App.css'
import { AppProvider, useApp } from './context/AppContext'
import TopNav from './components/Topnav'
import Sidebar from './components/Sidebar'
import ToastContainer from './components/Toastcontainer'
import JIRListing from './pages/Jirlisting'
import Inspection from './pages/Inspection'
import SpecMaster from './pages/Specmaster'

function ScreenRouter() {
  const { currentScreen } = useApp()

  switch (currentScreen) {
    case 'inspection':
      return <Inspection />
    case 'specmaster':
      return <SpecMaster />
    case 'content':
      return <JIRListing />
    case 'itemmaster':
      return (
        <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
          <h1 className="text-2xl font-bold mb-3">📦 Item Master</h1>
          <p className="text-slate-500">This section is not implemented yet. The item master page will show material masters and lookup data.</p>
        </div>
      )
    case 'vendors':
      return (
        <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
          <h1 className="text-2xl font-bold mb-3">🚚 Vendor List</h1>
          <p className="text-slate-500">This section is not implemented yet. Vendor master data will appear here.</p>
        </div>
      )
    case 'analytics':
      return (
        <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
          <h1 className="text-2xl font-bold mb-3">📊 Analytics</h1>
          <p className="text-slate-500">This section is not implemented yet. Analytics dashboards will go here.</p>
        </div>
      )
    default:
      return <JIRListing />
  }
}

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopNav />
      <div className="flex gap-5 px-5 pt-5 pb-8 max-w-[1600px] mx-auto">
        <Sidebar />
        <main className="flex-1 min-h-[calc(100vh-120px)]">
          <ScreenRouter />
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
