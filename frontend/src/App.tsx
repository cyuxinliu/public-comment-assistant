import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { link } from './components/ui/buttonStyles'
import { MockDocumentPage } from './pages/MockDocumentPage'
import { PermitDetailPage } from './pages/PermitDetailPage'
import { PermitListPage } from './pages/PermitListPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<PermitListPage />} />
          <Route path="/permits/:permitId" element={<PermitDetailPage />} />
          <Route path="/documents/:permitId/:sourceId" element={<MockDocumentPage />} />
          <Route path="*" element={<p className="text-slate-700">Page not found. <Link to="/" className={link}>Back to permits</Link></p>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
