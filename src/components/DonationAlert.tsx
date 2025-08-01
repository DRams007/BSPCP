import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const DonationAlert = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const bankDetails = {
    bankName: "First National Bank (FNB)",
    accountName: "Botswana Society of Professional Clinical Psychologists",
    accountNumber: "12345678901",
    branchCode: "280172",
    swiftCode: "FIRNBWGX"
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto border-2 border-primary/20 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Heart className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
              Support Mental Health in Botswana
            </CardTitle>
            <p className="text-muted-foreground mt-2 text-lg">
              Your donation helps us provide accessible mental health services to our community
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">Bank Transfer Details</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Bank Name</p>
                      <p className="font-medium">{bankDetails.bankName}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.bankName, "Bank Name")}
                    >
                      {copiedField === "Bank Name" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Account Name</p>
                      <p className="font-medium text-sm">{bankDetails.accountName}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.accountName, "Account Name")}
                    >
                      {copiedField === "Account Name" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Account Number</p>
                      <p className="font-medium font-mono">{bankDetails.accountNumber}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.accountNumber, "Account Number")}
                    >
                      {copiedField === "Account Number" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Branch Code</p>
                        <p className="font-medium font-mono">{bankDetails.branchCode}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.branchCode, "Branch Code")}
                      >
                        {copiedField === "Branch Code" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">SWIFT Code</p>
                        <p className="font-medium font-mono">{bankDetails.swiftCode}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.swiftCode, "SWIFT Code")}
                      >
                        {copiedField === "SWIFT Code" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">Your Impact</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-semibold text-primary mb-2">P500 Donation</h4>
                    <p className="text-sm text-muted-foreground">
                      Provides one therapy session for someone in need
                    </p>
                  </div>
                  
                  <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                    <h4 className="font-semibold text-secondary-foreground mb-2">P1,500 Donation</h4>
                    <p className="text-sm text-muted-foreground">
                      Sponsors mental health awareness workshop for a community
                    </p>
                  </div>
                  
                  <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                    <h4 className="font-semibold text-accent-foreground mb-2">P5,000 Donation</h4>
                    <p className="text-sm text-muted-foreground">
                      Funds training for a new mental health counselor
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                BSPCP is a registered non-profit organization. All donations are tax-deductible.
                <br />
                For donation receipts, please contact us at{" "}
                <span className="font-medium text-primary">donations@bspcp.org</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonationAlert;