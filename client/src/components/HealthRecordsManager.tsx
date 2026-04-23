import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/dialog";
import { Download, Share2, QrCode, Eye, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import QRCode from "qrcode.react";
import html2pdf from "html2pdf.js";
import type { HealthRecord } from "@shared/schema";

interface HealthRecordsManagerProps {
  records: HealthRecord[];
  userId: string;
  isLoading?: boolean;
}

export default function HealthRecordsManager({ records, userId, isLoading = false }: HealthRecordsManagerProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const generateQRData = (record: HealthRecord) => {
    return JSON.stringify({
      recordId: record.id,
      userId,
      type: record.type,
      title: record.title,
      date: new Date(record.createdAt).toLocaleDateString(),
      description: record.description,
      timestamp: Date.now(),
    });
  };

  const downloadRecordAsPDF = async (record: HealthRecord) => {
    try {
      setDownloading(true);
      
      const element = document.createElement("div");
      element.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>${record.title}</h2>
          <p><strong>Record Type:</strong> ${record.type}</p>
          <p><strong>Date:</strong> ${new Date(record.createdAt).toLocaleDateString()}</p>
          <p><strong>Description:</strong></p>
          <p>${record.description}</p>
          <hr />
          <p><small>Generated on ${new Date().toLocaleString()}</small></p>
        </div>
      `;

      const options = {
        margin: 10,
        filename: `health-record-${record.id}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      };

      html2pdf().set(options).from(element).save();
      
      toast({
        title: "Success",
        description: "Health record downloaded successfully",
      });
    } catch (error) {
      console.error("PDF download error:", error);
      toast({
        title: "Error",
        description: "Failed to download record",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const shareRecord = async (record: HealthRecord) => {
    try {
      const shareData = {
        title: record.title,
        text: `Check my health record: ${record.description}`,
        url: `${window.location.origin}?recordId=${record.id}&userId=${userId}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Shared",
          description: "Record shared successfully",
        });
      } else {
        // Fallback: Copy to clipboard
        const shareLink = shareData.url;
        navigator.clipboard.writeText(shareLink);
        toast({
          title: "Copied",
          description: "Share link copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("patient.healthRecords")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("patient.healthRecords")}</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t("patient.noRecords")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{record.title}</h3>
                        <Badge variant="outline">{record.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowQR(true);
                        }}
                      >
                        <QrCode className="w-4 h-4 mr-1" />
                        {t("patient.viewQR")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadRecordAsPDF(record)}
                        disabled={downloading}
                      >
                        {downloading ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-1" />
                        )}
                        {t("common.download")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareRecord(record)}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        {t("common.share")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRecord(record)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {t("common.view")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQR && !!selectedRecord} onOpenChange={setShowQR}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("patient.viewQR")}</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={generateQRData(selectedRecord)} size={200} level="H" />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p className="font-semibold">{selectedRecord.title}</p>
                <p>{new Date(selectedRecord.createdAt).toLocaleDateString()}</p>
              </div>
              <Button
                onClick={() => {
                  const canvas = document.querySelector("canvas");
                  if (canvas) {
                    const link = document.createElement("a");
                    link.href = canvas.toDataURL("image/png");
                    link.download = `qr-${selectedRecord.id}.png`;
                    link.click();
                  }
                }}
                className="w-full"
              >
                {t("common.download")} QR Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Record Details Dialog */}
      <Dialog open={!!selectedRecord && !showQR} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRecord?.title}</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Type</p>
                <p className="text-sm">{selectedRecord.type}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Date</p>
                <p className="text-sm">
                  {new Date(selectedRecord.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Description</p>
                <p className="text-sm">{selectedRecord.description}</p>
              </div>
              {selectedRecord.metadata && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Additional Information</p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(selectedRecord.metadata, null, 2)}
                  </pre>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => downloadRecordAsPDF(selectedRecord)}
                  disabled={downloading}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t("common.download")}
                </Button>
                <Button
                  onClick={() => shareRecord(selectedRecord)}
                  variant="outline"
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {t("common.share")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
