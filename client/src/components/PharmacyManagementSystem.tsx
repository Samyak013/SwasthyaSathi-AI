import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Check, AlertCircle, Package, TrendingDown, Plus, Search, Filter,
  Eye, CheckCircle, Clock, Trash2, Edit2, Pill, BarChart3,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Prescription } from "@shared/schema";

interface PharmacyItem {
  id: string;
  name: string;
  dosage: string;
  quantity: number;
  price: number;
  expiryDate: string;
  batchNo: string;
  supplier: string;
  minStock: number;
}

interface PendingPrescription {
  id: string;
  patientName: string;
  prescriptionDate: string;
  medicines: Array<{
    name: string;
    dosage: string;
    quantity: number;
  }>;
  status: "pending" | "verified" | "dispensed";
}

interface PharmacyPortalProps {
  pharmacyName: string;
  location: string;
  userId?: string;
}

export default function PharmacyManagementSystem({
  pharmacyName,
  location,
  userId,
}: PharmacyPortalProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<PendingPrescription | null>(null);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    dosage: "",
    quantity: 0,
    price: 0,
    expiryDate: "",
    batchNo: "",
    supplier: "",
    minStock: 10,
  });

  // Mock data
  const [inventory, setInventory] = useState<PharmacyItem[]>([
    {
      id: "m1",
      name: "Aspirin",
      dosage: "500mg",
      quantity: 150,
      price: 50,
      expiryDate: "2025-12-31",
      batchNo: "BATCH001",
      supplier: "PharmaCorp",
      minStock: 50,
    },
    {
      id: "m2",
      name: "Amoxicillin",
      dosage: "250mg",
      quantity: 80,
      price: 120,
      expiryDate: "2025-06-30",
      batchNo: "BATCH002",
      supplier: "MediSupply",
      minStock: 40,
    },
    {
      id: "m3",
      name: "Metformin",
      dosage: "500mg",
      quantity: 25,
      price: 200,
      expiryDate: "2026-03-15",
      batchNo: "BATCH003",
      supplier: "HealthCare Ltd",
      minStock: 50,
    },
    {
      id: "m4",
      name: "Lisinopril",
      dosage: "10mg",
      quantity: 120,
      price: 300,
      expiryDate: "2025-09-20",
      batchNo: "BATCH004",
      supplier: "CardioMed",
      minStock: 60,
    },
  ]);

  const [pendingPrescriptions] = useState<PendingPrescription[]>([
    {
      id: "px1",
      patientName: "John Doe",
      prescriptionDate: new Date().toISOString(),
      medicines: [
        { name: "Aspirin", dosage: "500mg", quantity: 10 },
        { name: "Amoxicillin", dosage: "250mg", quantity: 7 },
      ],
      status: "pending",
    },
    {
      id: "px2",
      patientName: "Jane Smith",
      prescriptionDate: new Date(Date.now() - 86400000).toISOString(),
      medicines: [
        { name: "Metformin", dosage: "500mg", quantity: 30 },
      ],
      status: "verified",
    },
  ]);

  const lowStockItems = inventory.filter((item) => item.quantity < item.minStock);
  const expiringSoonItems = inventory.filter((item) => {
    const expiryDate = new Date(item.expiryDate);
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return expiryDate <= thirtyDaysFromNow;
  });

  const addMedicine = () => {
    if (!newMedicine.name || !newMedicine.dosage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const medicine: PharmacyItem = {
      id: `m${Date.now()}`,
      ...newMedicine,
    };

    setInventory([...inventory, medicine]);
    setNewMedicine({
      name: "",
      dosage: "",
      quantity: 0,
      price: 0,
      expiryDate: "",
      batchNo: "",
      supplier: "",
      minStock: 10,
    });
    setShowAddMedicine(false);

    toast({
      title: "Success",
      description: `${newMedicine.name} added to inventory`,
    });
  };

  const deleteMedicine = (id: string) => {
    setInventory(inventory.filter((item) => item.id !== id));
    toast({
      title: "Success",
      description: "Medicine removed from inventory",
    });
  };

  const verifyPrescription = (id: string) => {
    toast({
      title: "Success",
      description: "Prescription verified successfully",
    });
  };

  const dispenseMedicine = (id: string) => {
    toast({
      title: "Success",
      description: "Medicine dispensed successfully",
    });
  };

  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Medicines</p>
              <p className="text-3xl font-bold">{inventory.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Low Stock Items</p>
              <p className="text-3xl font-bold text-orange-600">{lowStockItems.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Expiring Soon</p>
              <p className="text-3xl font-bold text-red-600">{expiringSoonItems.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Inventory Value</p>
              <p className="text-3xl font-bold">₹{Math.round(totalInventoryValue / 1000)}K</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="prescriptions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prescriptions">
            <Pill className="w-4 h-4 mr-2" />
            Prescriptions
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="w-4 h-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertCircle className="w-4 h-4 mr-2" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("pharmacy.pendingPrescriptions")}</CardTitle>
              <Badge variant="destructive">{pendingPrescriptions.filter(p => p.status === "pending").length}</Badge>
            </CardHeader>
            <CardContent>
              {pendingPrescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No prescriptions to process</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPrescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold">{prescription.patientName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(prescription.prescriptionDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            prescription.status === "pending"
                              ? "secondary"
                              : prescription.status === "verified"
                              ? "outline"
                              : "default"
                          }
                        >
                          {prescription.status.charAt(0).toUpperCase() +
                            prescription.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="mb-3 space-y-1">
                        {prescription.medicines.map((med, idx) => (
                          <p key={idx} className="text-sm">
                            • {med.name} {med.dosage} × {med.quantity}
                          </p>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        {prescription.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                verifyPrescription(prescription.id);
                                setSelectedPrescription(prescription);
                              }}
                              className="gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Verify
                            </Button>
                          </>
                        )}
                        {prescription.status === "verified" && (
                          <Button
                            size="sm"
                            onClick={() => dispenseMedicine(prescription.id)}
                            className="gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Dispense
                          </Button>
                        )}
                        {prescription.status === "dispensed" && (
                          <Badge variant="default" className="gap-1">
                            <Check className="w-4 h-4" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("pharmacy.inventory")}</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowAddMedicine(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("pharmacy.addMedicine")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <Input
                  placeholder={t("pharmacy.searchMedicines")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {inventory
                  .filter(
                    (item) =>
                      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.dosage.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded-lg flex items-start justify-between hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge variant="outline">{item.dosage}</Badge>
                          {item.quantity < item.minStock && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Low Stock
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{t("pharmacy.stockLevel")}: {item.quantity} units</p>
                          <p>{t("pharmacy.price")}: ₹{item.price}</p>
                          <p>Batch: {item.batchNo}</p>
                          <p>{t("pharmacy.expiry")}: {new Date(item.expiryDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAddMedicine(true)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMedicine(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {/* Low Stock Items */}
          <Card className="border-orange-200 bg-orange-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <TrendingDown className="w-5 h-5" />
                Low Stock Items ({lowStockItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <p className="text-muted-foreground">All items are well stocked</p>
              ) : (
                <div className="space-y-2">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="p-3 bg-white rounded border-l-4 border-orange-400">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{item.name} {item.dosage}</p>
                          <p className="text-sm text-muted-foreground">
                            Current: {item.quantity} units (Min: {item.minStock})
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          {t("pharmacy.restock")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expiring Soon Items */}
          <Card className="border-red-200 bg-red-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <Clock className="w-5 h-5" />
                Expiring Soon ({expiringSoonItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expiringSoonItems.length === 0 ? (
                <p className="text-muted-foreground">No items expiring soon</p>
              ) : (
                <div className="space-y-2">
                  {expiringSoonItems.map((item) => (
                    <div key={item.id} className="p-3 bg-white rounded border-l-4 border-red-400">
                      <p className="font-semibold">{item.name} {item.dosage}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {new Date(item.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Medicine Dialog */}
      <Dialog open={showAddMedicine} onOpenChange={setShowAddMedicine}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("pharmacy.addMedicine")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Medicine Name"
              value={newMedicine.name}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, name: e.target.value })
              }
            />
            <Input
              placeholder="Dosage (e.g., 500mg)"
              value={newMedicine.dosage}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, dosage: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Quantity"
              value={newMedicine.quantity}
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  quantity: parseInt(e.target.value) || 0,
                })
              }
            />
            <Input
              type="number"
              placeholder="Price"
              value={newMedicine.price}
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  price: parseInt(e.target.value) || 0,
                })
              }
            />
            <Input
              type="date"
              value={newMedicine.expiryDate}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, expiryDate: e.target.value })
              }
            />
            <Input
              placeholder="Batch Number"
              value={newMedicine.batchNo}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, batchNo: e.target.value })
              }
            />
            <Input
              placeholder="Supplier"
              value={newMedicine.supplier}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, supplier: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Minimum Stock Level"
              value={newMedicine.minStock}
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  minStock: parseInt(e.target.value) || 10,
                })
              }
            />
            <div className="flex gap-3">
              <Button onClick={addMedicine} className="flex-1">
                {t("common.save")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddMedicine(false)}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
