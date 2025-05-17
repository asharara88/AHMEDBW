import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  routes?: Record<string, string>;
}

const defaultRoutes: Record<string, string> = {
  dashboard: 'Dashboard',
  chat: 'Coach',
  supplements: 'Supplements',
  devices: 'Devices',
  insights: 'Insights',
  profile: 'Profile',
  admin: 'Admin',
};

const Breadcrumbs = ({ routes = defaultRoutes }: BreadcrumbsProps) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Link to="/" className="text-text-light hover:text-primary">
        Home
      </Link>
      {pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;
        const label = routes[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-text-light" />
            {isLast ? (
              <span className="ml-2 font-medium text-text">{label}</span>
            ) : (
              <Link to={path} className="ml-2 text-text-light hover:text-primary">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;