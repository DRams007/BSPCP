import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RenewalUploadForm from '@/components/membership/RenewalUploadForm';
import { CheckCircle, AlertTriangle, Lock, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MemberInfo {
  id: string;
  name: string;
  email: string;
  membershipType: string;
  member_status: 'active' | 'pending_password_setup' | 'expired';
  renewal_status: 'not_requested' | 'requested' | 'uploaded' | 'verified' | 'rejected';
}

const RenewalUpload = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);

  const renewalToken = searchParams.get('token');

  useEffect(() => {
    const validateTokenAndGetInfo = async () => {
      if (!renewalToken) {
        setError('No renewal token provided. Please use a valid link from your email.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/member/renewal-token/${renewalToken}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('This renewal link has expired. Please contact support for a new link.');
          } else if (response.status === 404) {
            setError('Invalid renewal link. Please check the URL and try again.');
          } else {
            setError('Unable to validate renewal link. Please try again later.');
          }
          return;
        }

        const data = await response.json();
        setMemberInfo(data.member);
        setTokenValid(true);

      } catch (error) {
        setError('Network error. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    validateTokenAndGetInfo();
  }, [renewalToken]);

  const handleUploadSuccess = (uploadData: any) => {
    setUploadComplete(true);

    toast({
      title: "Renewal Proof Submitted!",
      description: "Your renewal proof is now under review. You'll receive an email notification once verified.",
      variant: "default",
    });
  };

  const handleUploadError = (errorMessage: string) => {
    toast({
      title: "Upload Failed",
      description: errorMessage,
      variant: "destructive",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-center text-muted-foreground">
                Validating renewal link...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">Access Error</h2>
                <p className="text-muted-foreground">{error}</p>
              </div>

              <div className="w-full space-y-3">
                <Button
                  onClick={() => navigate('/')}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid || !memberInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-red-600" />
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
                <p className="text-muted-foreground">
                  Invalid or expired renewal link. Please check your email for a valid link.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (uploadComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Renewal Proof Submitted!</h2>
                <p className="text-muted-foreground max-w-md">
                  Thank you, <span className="font-medium">{memberInfo.name}</span>.
                  Your renewal proof has been successfully submitted and is now under review.
                </p>
              </div>

              <Alert className="w-full">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>What happens next?</strong> Our team will review your renewal proof within 1-2 business days.
                  You'll receive an email notification once verification is complete.
                </AlertDescription>
              </Alert>

              <div className="w-full space-y-3">
                <Button
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Return to Homepage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {memberInfo.name}!
                </h1>
                <p className="text-muted-foreground">
                  Complete your membership renewal by uploading payment proof
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Dynamic membership type display */}
                <Badge
                  variant={memberInfo.membershipType === 'professional' ? 'default' : 'secondary'}
                  className="bg-blue-100 text-blue-800"
                >
                  {memberInfo.membershipType
                    ? memberInfo.membershipType.charAt(0).toUpperCase() + memberInfo.membershipType.slice(1) + ' Member'
                    : 'Member'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <RenewalUploadForm
          memberId={memberInfo.id}
          renewalToken={renewalToken!}
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
        />

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Having issues? <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/contact')}>
            Contact Support
          </Button></p>
        </div>
      </div>
    </div>
  );
};

export default RenewalUpload;
