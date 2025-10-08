import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminRouteGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'super_admin';
  fallbackPath?: string;
}

const AdminRouteGuard = ({
  children,
  requiredRole = 'admin',
  fallbackPath = '/admin/login'
}: AdminRouteGuardProps) => {
  const { isAuthenticated, isLoading, hasRole, user, refreshAuth } = useAuth();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const validateAccess = async () => {
      if (!isLoading) {
        setIsValidating(true);
        setValidationError(null);

        // If user is authenticated but we need to verify token validity
        if (isAuthenticated) {
          try {
            // Attempt to refresh auth to ensure token is still valid
            const isRefreshed = await refreshAuth();

            if (!isRefreshed && !refreshAuth) {
              // Token validation failed
              setValidationError('Your session has expired. Please login again.');
            }
          } catch (error) {
            console.error('Auth validation error:', error);
            setValidationError('Unable to validate your session. Please try again.');
          }
        }

        setIsValidating(false);
      }
    };

    if (!isLoading) {
      validateAccess();
    }
  }, [isLoading, isAuthenticated, refreshAuth]);

  // Show loading spinner while initializing auth state
  if (isLoading || isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Validating access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login with return url
  if (!isAuthenticated) {
    const returnUrl = location.pathname + location.search;
    return (
      <Navigate
        to={`${fallbackPath}?returnUrl=${encodeURIComponent(returnUrl)}`}
        replace
        state={{ from: location }}
      />
    );
  }

  // Check permission level
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-orange-800">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don't have permission to access this page.
                <br />
                <strong>Required:</strong> {requiredRole === 'super_admin' ? 'Super Admin' : 'Admin'} role
                <br />
                <strong>Your role:</strong> {user?.role ? user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
              </AlertDescription>
            </Alert>
            <div className="mt-6 flex flex-col gap-2">
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full"
              >
                Go Back
              </Button>
              <Button
                onClick={() => window.location.href = '/admin/dashboard'}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show validation error if any
  if (validationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
            <div className="mt-6 flex flex-col gap-2">
              <Button
                onClick={() => window.location.href = '/admin/login'}
                className="w-full"
              >
                Login Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All checks passed - render the protected content
  return <>{children}</>;
};

// Convenience wrapper for super admin only routes
export const SuperAdminRouteGuard = ({ children, fallbackPath }: Omit<AdminRouteGuardProps, 'requiredRole'>) => (
  <AdminRouteGuard requiredRole="super_admin" fallbackPath={fallbackPath}>
    {children}
  </AdminRouteGuard>
);

// Convenience wrapper for admin routes (admin and above)
export const AdminOnlyRouteGuard = ({ children, fallbackPath }: Omit<AdminRouteGuardProps, 'requiredRole'>) => (
  <AdminRouteGuard requiredRole="admin" fallbackPath={fallbackPath}>
    {children}
  </AdminRouteGuard>
);

export default AdminRouteGuard;
