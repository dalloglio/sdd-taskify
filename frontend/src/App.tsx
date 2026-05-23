import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProjectDetails from './pages/ProjectDetails';
import ProjectList from './pages/ProjectList';
import UserSelector from './pages/UserSelector';

export default function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Layout>
        <nav className="flex gap-4 mb-4 text-sm">
          <Link to="/user-select">Select User</Link>
          <Link to="/projects">Projects</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/user-select" element={<UserSelector />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
