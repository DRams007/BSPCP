import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, CheckCircle, AlertCircle, CreditCard, DollarSign, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RenewalUploadFormProps {
  memberId?: string;
  renewalToken?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

const RenewalUploadForm = ({ memberId, renewalToken, onSuccess, onError }: RenewalUploadFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF, JPG, or PNG files only.",
          variant: "destructive",
        });
        return;
      }

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
        description: "Please select a renewal proof file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('renewalProof', selectedFile);

      const authToken = renewalToken || localStorage.getItem('token');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/renewal/upload`, {
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

      toast({
        title: "Renewal Proof Uploaded Successfully!",
        description: "Your renewal proof is now under review. You'll be notified once it's verified.",
        variant: "default",
      });

      setSelectedFile(null);

      onSuccess?.(result);

    } catch (error) {
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
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <CreditCard className="w-6 h-6" />
            Upload Renewal Proof
          </CardTitle>
          <CardDescription>
            Complete your membership renewal by uploading proof of payment for verification
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Renewal Information
          </CardTitle>
          <CardDescription>
            Please ensure your payment was made to the following account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Bank:</strong> Stanbic Bank of Botswana
              </div>
              <div>
                <strong>Account Name:</strong> Botswana Society of Professional Counsellors and Psychotherapists
              </div>
              <div>
                <strong>Account Number:</strong> 906 000 5981 641
              </div>
              <div>
                <strong>Branch:</strong> Fairground Branch (Branch No: 1011)
              </div>
                            <div>
               <strong>Branch Code:</strong> 064 967
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800 font-medium">
                <strong>Annual Renewal Fee:</strong> BWP 150.00
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

      <Card>
        <CardHeader>
          <CardTitle>Submit Renewal Proof</CardTitle>
          <CardDescription>
            Upload your payment receipt or bank statement for verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <Label htmlFor="renewal-proof">Renewal Proof Document *</Label>
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
                            <label htmlFor="renewal-proof" className="cursor-pointer">
                              Click to upload renewal proof
                            </label>
                          </Button>
                          <input
                            id="renewal-proof"
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

            <Button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="w-full"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading Renewal Proof...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Renewal Proof
                </>
              )}
            </Button>

            {isUploading && uploadProgress > 0 && (
              <Progress value={uploadProgress} className="h-2" />
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RenewalUploadForm;
