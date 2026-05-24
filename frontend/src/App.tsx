import { lazy, Suspense } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';

const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const ProjectList = lazy(() => import('./pages/ProjectList'));
const UserSelector = lazy(() => import('./pages/UserSelector'));

export default function App() {
  return (
    <BrowserRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <Layout>
        <nav className="flex gap-4 mb-4 text-sm">
          <Link to="/user-select">Select User</Link>
          <Link to="/projects">Projects</Link>
        </nav>
        <Suspense
          fallback={
            <div className="rounded-md bg-white p-4 text-gray-700">
              Loading...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/user-select" element={<UserSelector />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:projectId" element={<ProjectDetails />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}
