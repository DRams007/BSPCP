import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, CheckCircle, AlertCircle, CreditCard, DollarSign, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentUploadFormProps {
  memberId?: string;
  uploadToken?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

const PaymentUploadForm = ({ memberId, uploadToken, onSuccess, onError }: PaymentUploadFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();



  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF, JPG, or PNG files only.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please upload files smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a payment proof file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('paymentProof', selectedFile);

      console.log('Starting payment proof upload...');

      // Use uploadToken prop if provided, otherwise fallback to localStorage token
      const authToken = uploadToken || localStorage.getItem('token');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/member/payment-proof`, {
        method: 'POST',
        headers: {
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, try to get text (for cases where server returns HTML)
          try {
            const textError = await response.text();
            errorMessage = textError || errorMessage;
          } catch (textError) {
            // Use default error message
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Upload successful:', result);

      toast({
        title: "Payment Proof Uploaded Successfully!",
        description: "Your payment proof is now under review. You'll be notified once it's verified.",
        variant: "default",
      });

      // Reset form
      setSelectedFile(null);

      // Call success callback
      onSuccess?.(result);

    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });

      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Upload className="w-8 h-8 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <Upload className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <CreditCard className="w-6 h-6" />
            Upload Payment Proof
          </CardTitle>
          <CardDescription>
            Complete your membership by uploading proof of payment for verification
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Payment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payment Information
          </CardTitle>
          <CardDescription>
            Please ensure your payment was made to the following account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Bank:</strong> First National Bank Botswana
              </div>
              <div>
                <strong>Account Name:</strong> Botswana Wellbeing Pathways
              </div>
              <div>
                <strong>Account Number:</strong> 1234567890
              </div>
              <div>
                <strong>Branch:</strong> Main Branch (123)
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800 font-medium">
                <strong>Membership Fee:</strong> BWP 50.00 (Joining) + BWP 150.00 (Annual) = BWP 200.00 Total
              </p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Important:</strong> Please use a clear, readable document showing:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Full bank statement showing the transfer</li>
              <li>Reference number/transaction ID</li>
              <li>Amount paid and date</li>
              <li>Sender and recipient details</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Payment Proof</CardTitle>
          <CardDescription>
            Upload your payment receipt or bank statement for verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-6">
            {/* File Upload */}
            <div>
              <Label htmlFor="payment-proof">Payment Proof Document *</Label>
              <div className="mt-2">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                  <div className="text-center">
                    {selectedFile ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2">
                          {getFileIcon(selectedFile.type)}
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setSelectedFile(null)}
                        >
                          Choose Different File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <div>
                          <Button type="button" variant="outline" className="cursor-pointer">
                            <label htmlFor="payment-proof" className="cursor-pointer">
                              Click to upload payment proof
                            </label>
                          </Button>
                          <input
                            id="payment-proof"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            required
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            PDF, JPG, PNG files up to 5MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>



            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="w-full"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading Payment Proof...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Payment Proof
                </>
              )}
            </Button>

            {/* Upload Progress */}
            {isUploading && uploadProgress > 0 && (
              <Progress value={uploadProgress} className="h-2" />
            )}
          </form>
        </CardContent>
      </Card>

      {/* Help Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>What if my upload fails?</strong></p>
            <p className="text-muted-foreground mb-3">
              If you encounter issues, try using a different browser or compressing your file.
              Maximum file size is 5MB and only PDF, JPG, and PNG formats are supported.
            </p>

            <p><strong>How long does verification take?</strong></p>
            <p className="text-muted-foreground">
              Payment verification typically takes 1-2 business days. You'll receive an email notification once your payment is approved.
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <Badge variant="secondary">Step 4 of 4: Payment Verification</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentUploadForm;
