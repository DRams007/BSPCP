import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PaymentUploadForm from '@/components/PaymentUploadForm';
import { CheckCircle, AlertTriangle, Lock, ArrowRight, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UploadResult } from '../types/upload';

interface MemberInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  membershipType: string;
  applicationStatus: 'approved' | 'pending' | 'rejected';
  paymentStatus: 'not_requested' | 'requested' | 'uploaded' | 'verified' | 'rejected';
  paymentUploadToken?: string;
  paymentRequiredBy?: string;
}



const PaymentUpload = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);

  const uploadToken = searchParams.get('token');

  useEffect(() => {
    const validateTokenAndGetInfo = async () => {
      if (!uploadToken) {
        setError('No payment upload token provided. Please use a valid link from your email.');
        setLoading(false);
        return;
      }

      try {
        console.log('Validating payment upload token...');

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/member/payment-token/${uploadToken}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('This payment link has expired. Please contact support for a new link.');
          } else if (response.status === 404) {
            setError('Invalid payment link. Please check the URL and try again.');
          } else {
            setError('Unable to validate payment link. Please try again later.');
          }
          return;
        }

        const data = await response.json();
        console.log('Token validation successful:', data);

        setMemberInfo(data.member);
        setTokenValid(true);

      } catch (error) {
        console.error('Token validation error:', error);
        setError('Network error. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    validateTokenAndGetInfo();
  }, [uploadToken]);

  const handleUploadSuccess = (uploadData: UploadResult) => {
    console.log('Payment upload successful:', uploadData);
    setUploadComplete(true);

    toast({
      title: "Payment Proof Submitted!",
      description: "Your payment proof is now under review. You'll receive an email notification once verified.",
      variant: "default",
    });
  };

  const handleUploadError = (errorMessage: string) => {
    console.error('Payment upload error:', errorMessage);
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
                Validating payment link...
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

                <Button
                  onClick={() => window.location.reload()}
                  className="w-full"
                  variant="ghost"
                >
                  Try Again
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
                  Invalid or expired payment link. Please check your email for a valid link.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safe access to payment status with fallback
  const paymentStatus = memberInfo.paymentStatus || 'unknown';

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
                <h2 className="text-2xl font-bold text-gray-900">Payment Proof Submitted!</h2>
                <p className="text-muted-foreground max-w-md">
                  Thank you, <span className="font-medium">{memberInfo.first_name} {memberInfo.last_name}</span>.
                  Your payment proof has been successfully submitted and is now under review.
                </p>
              </div>

              <Alert className="w-full">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>What happens next?</strong> Our team will review your payment proof within 1-2 business days.
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
        {/* Header Status */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {memberInfo.first_name} {memberInfo.last_name}!
                </h1>
                <p className="text-muted-foreground">
                  Complete your membership by uploading payment proof
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Dynamic membership type display */}
                <Badge
                  variant={memberInfo.membershipType === 'professional' ? 'default' : 'secondary'}
                  className="bg-blue-100 text-blue-800"
                >
                  {memberInfo.membershipType
                    ? memberInfo.membershipType.charAt(0).toUpperCase() + memberInfo.membershipType.slice(1) + ' Membership'
                    : 'Membership'}
                </Badge>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="mt-6">
              <div className="flex items-center justify-between max-w-md">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="ml-2 text-sm font-medium">Application Approved</span>
                </div>

                <div className="w-8 border-t border-gray-300 mx-2"></div>

                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="ml-2 text-sm font-medium">Payment Proof Required</span>
                </div>

                <div className="w-8 border-t border-gray-300 mx-2"></div>

                <div className="flex items-center opacity-60">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">3</span>
                  </div>
                  <span className="ml-2 text-sm font-medium">Verification</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Upload Form */}
        <PaymentUploadForm
          memberId={memberInfo.id}
          uploadToken={uploadToken!}
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
        />

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Having issues? <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/contact')}>
            Contact Support
          </Button></p>
        </div>
      </div>
    </div>
  );
};

export default PaymentUpload;
