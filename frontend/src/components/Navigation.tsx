import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav className="flex gap-4 text-sm">
      <Link to="/projects">Projects</Link>
      <Link to="/user-select">User</Link>
    </nav>
  );
}
