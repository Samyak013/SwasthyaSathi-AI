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

  // Mock data with realistic dates (April 23, 2026 is today)
  // Comprehensive medicine inventory with 105+ medicines
  const [inventory, setInventory] = useState<PharmacyItem[]>([
    // Analgesics (15)
    { id: "m1", name: "Paracetamol", dosage: "500mg", quantity: 200, price: 45, expiryDate: "2026-12-31", batchNo: "BATCH001", supplier: "PharmaCorp", minStock: 100 },
    { id: "m2", name: "Paracetamol", dosage: "650mg", quantity: 180, price: 55, expiryDate: "2026-12-31", batchNo: "BATCH002", supplier: "PharmaCorp", minStock: 80 },
    { id: "m3", name: "Ibuprofen", dosage: "200mg", quantity: 150, price: 65, expiryDate: "2026-11-30", batchNo: "BATCH003", supplier: "MediLife", minStock: 70 },
    { id: "m4", name: "Ibuprofen", dosage: "400mg", quantity: 120, price: 85, expiryDate: "2026-11-30", batchNo: "BATCH004", supplier: "MediLife", minStock: 60 },
    { id: "m5", name: "Diclofenac", dosage: "50mg", quantity: 90, price: 75, expiryDate: "2026-10-15", batchNo: "BATCH005", supplier: "HealthCare Ltd", minStock: 40 },
    { id: "m6", name: "Aceclofenac", dosage: "100mg", quantity: 110, price: 95, expiryDate: "2026-10-30", batchNo: "BATCH006", supplier: "CardioMed", minStock: 50 },
    { id: "m7", name: "Ketorolac", dosage: "10mg", quantity: 60, price: 120, expiryDate: "2026-09-20", batchNo: "BATCH007", supplier: "PharmaCorp", minStock: 30 },
    { id: "m8", name: "Tramadol", dosage: "50mg", quantity: 80, price: 150, expiryDate: "2026-12-15", batchNo: "BATCH008", supplier: "MediSupply", minStock: 40 },
    { id: "m9", name: "Aspirin", dosage: "75mg", quantity: 200, price: 35, expiryDate: "2026-12-31", batchNo: "BATCH009", supplier: "PharmaCorp", minStock: 100 },
    { id: "m10", name: "Aspirin", dosage: "325mg", quantity: 150, price: 50, expiryDate: "2026-12-31", batchNo: "BATCH010", supplier: "PharmaCorp", minStock: 80 },
    { id: "m11", name: "Naproxen", dosage: "250mg", quantity: 100, price: 88, expiryDate: "2026-11-10", batchNo: "BATCH011", supplier: "MediLife", minStock: 50 },
    { id: "m12", name: "Mefenamic Acid", dosage: "500mg", quantity: 130, price: 72, expiryDate: "2026-10-20", batchNo: "BATCH012", supplier: "HealthCare Ltd", minStock: 60 },
    { id: "m13", name: "Etoricoxib", dosage: "60mg", quantity: 70, price: 140, expiryDate: "2026-11-30", batchNo: "BATCH013", supplier: "CardioMed", minStock: 35 },
    { id: "m14", name: "Celecoxib", dosage: "200mg", quantity: 85, price: 165, expiryDate: "2026-12-15", batchNo: "BATCH014", supplier: "MediSupply", minStock: 40 },
    { id: "m15", name: "Morphine", dosage: "10mg", quantity: 45, price: 450, expiryDate: "2026-08-30", batchNo: "BATCH015", supplier: "PharmaCorp", minStock: 20 },

    // Antibiotics (20)
    { id: "m16", name: "Amoxicillin", dosage: "250mg", quantity: 200, price: 120, expiryDate: "2026-08-30", batchNo: "BATCH016", supplier: "MediSupply", minStock: 100 },
    { id: "m17", name: "Amoxicillin", dosage: "500mg", quantity: 180, price: 150, expiryDate: "2026-08-30", batchNo: "BATCH017", supplier: "MediSupply", minStock: 90 },
    { id: "m18", name: "Amoxicillin+Clavulanic Acid", dosage: "625mg", quantity: 160, price: 200, expiryDate: "2026-09-15", batchNo: "BATCH018", supplier: "HealthCare Ltd", minStock: 80 },
    { id: "m19", name: "Cefixime", dosage: "200mg", quantity: 140, price: 180, expiryDate: "2026-10-10", batchNo: "BATCH019", supplier: "CardioMed", minStock: 70 },
    { id: "m20", name: "Ceftriaxone", dosage: "1g", quantity: 120, price: 350, expiryDate: "2026-07-30", batchNo: "BATCH020", supplier: "PharmaCorp", minStock: 50 },
    { id: "m21", name: "Azithromycin", dosage: "250mg", quantity: 130, price: 220, expiryDate: "2026-09-20", batchNo: "BATCH021", supplier: "MediLife", minStock: 60 },
    { id: "m22", name: "Azithromycin", dosage: "500mg", quantity: 110, price: 280, expiryDate: "2026-09-20", batchNo: "BATCH022", supplier: "MediLife", minStock: 50 },
    { id: "m23", name: "Clarithromycin", dosage: "500mg", quantity: 100, price: 260, expiryDate: "2026-10-05", batchNo: "BATCH023", supplier: "HealthCare Ltd", minStock: 45 },
    { id: "m24", name: "Ciprofloxacin", dosage: "500mg", quantity: 150, price: 95, expiryDate: "2026-11-30", batchNo: "BATCH024", supplier: "PharmaCorp", minStock: 70 },
    { id: "m25", name: "Levofloxacin", dosage: "500mg", quantity: 140, price: 110, expiryDate: "2026-11-15", batchNo: "BATCH025", supplier: "MediSupply", minStock: 65 },
    { id: "m26", name: "Ofloxacin", dosage: "200mg", quantity: 120, price: 85, expiryDate: "2026-10-30", batchNo: "BATCH026", supplier: "CardioMed", minStock: 55 },
    { id: "m27", name: "Metronidazole", dosage: "400mg", quantity: 180, price: 65, expiryDate: "2026-12-20", batchNo: "BATCH027", supplier: "PharmaCorp", minStock: 90 },
    { id: "m28", name: "Tinidazole", dosage: "500mg", quantity: 160, price: 75, expiryDate: "2026-12-10", batchNo: "BATCH028", supplier: "MediLife", minStock: 80 },
    { id: "m29", name: "Doxycycline", dosage: "100mg", quantity: 140, price: 130, expiryDate: "2026-11-25", batchNo: "BATCH029", supplier: "HealthCare Ltd", minStock: 70 },
    { id: "m30", name: "Tetracycline", dosage: "250mg", quantity: 100, price: 115, expiryDate: "2026-10-15", batchNo: "BATCH030", supplier: "MediSupply", minStock: 50 },
    { id: "m31", name: "Clindamycin", dosage: "300mg", quantity: 90, price: 145, expiryDate: "2026-09-30", batchNo: "BATCH031", supplier: "CardioMed", minStock: 45 },
    { id: "m32", name: "Linezolid", dosage: "600mg", quantity: 80, price: 380, expiryDate: "2026-08-20", batchNo: "BATCH032", supplier: "PharmaCorp", minStock: 40 },
    { id: "m33", name: "Vancomycin", dosage: "500mg", quantity: 60, price: 420, expiryDate: "2026-07-15", batchNo: "BATCH033", supplier: "MediLife", minStock: 25 },
    { id: "m34", name: "Gentamicin", dosage: "80mg", quantity: 70, price: 350, expiryDate: "2026-08-30", batchNo: "BATCH034", supplier: "HealthCare Ltd", minStock: 30 },
    { id: "m35", name: "Rifampicin", dosage: "600mg", quantity: 50, price: 280, expiryDate: "2026-09-10", batchNo: "BATCH035", supplier: "CardioMed", minStock: 20 },

    // Antidiabetic (10)
    { id: "m36", name: "Metformin", dosage: "500mg", quantity: 250, price: 200, expiryDate: "2027-03-15", batchNo: "BATCH036", supplier: "HealthCare Ltd", minStock: 120 },
    { id: "m37", name: "Metformin", dosage: "850mg", quantity: 220, price: 250, expiryDate: "2027-03-15", batchNo: "BATCH037", supplier: "HealthCare Ltd", minStock: 110 },
    { id: "m38", name: "Glimepiride", dosage: "1mg", quantity: 140, price: 95, expiryDate: "2026-12-01", batchNo: "BATCH038", supplier: "CardioMed", minStock: 70 },
    { id: "m39", name: "Glimepiride", dosage: "2mg", quantity: 130, price: 110, expiryDate: "2026-12-01", batchNo: "BATCH039", supplier: "CardioMed", minStock: 65 },
    { id: "m40", name: "Gliclazide", dosage: "80mg", quantity: 120, price: 105, expiryDate: "2026-11-20", batchNo: "BATCH040", supplier: "PharmaCorp", minStock: 60 },
    { id: "m41", name: "Sitagliptin", dosage: "100mg", quantity: 100, price: 380, expiryDate: "2026-10-30", batchNo: "BATCH041", supplier: "MediLife", minStock: 50 },
    { id: "m42", name: "Vildagliptin", dosage: "50mg", quantity: 110, price: 320, expiryDate: "2026-11-15", batchNo: "BATCH042", supplier: "MediSupply", minStock: 55 },
    { id: "m43", name: "Insulin Regular", dosage: "40IU/ml", quantity: 80, price: 550, expiryDate: "2026-06-30", batchNo: "BATCH043", supplier: "PharmaCorp", minStock: 40 },
    { id: "m44", name: "Insulin Glargine", dosage: "100IU/ml", quantity: 70, price: 650, expiryDate: "2026-07-15", batchNo: "BATCH044", supplier: "MediLife", minStock: 35 },
    { id: "m45", name: "Pioglitazone", dosage: "15mg", quantity: 90, price: 280, expiryDate: "2026-12-10", batchNo: "BATCH045", supplier: "HealthCare Ltd", minStock: 45 },

    // Cardiovascular (15)
    { id: "m46", name: "Amlodipine", dosage: "5mg", quantity: 200, price: 85, expiryDate: "2026-12-31", batchNo: "BATCH046", supplier: "CardioMed", minStock: 100 },
    { id: "m47", name: "Amlodipine", dosage: "10mg", quantity: 180, price: 95, expiryDate: "2026-12-31", batchNo: "BATCH047", supplier: "CardioMed", minStock: 90 },
    { id: "m48", name: "Losartan", dosage: "50mg", quantity: 160, price: 120, expiryDate: "2026-11-20", batchNo: "BATCH048", supplier: "PharmaCorp", minStock: 80 },
    { id: "m49", name: "Telmisartan", dosage: "40mg", quantity: 150, price: 135, expiryDate: "2026-11-30", batchNo: "BATCH049", supplier: "MediLife", minStock: 75 },
    { id: "m50", name: "Atenolol", dosage: "50mg", quantity: 170, price: 110, expiryDate: "2026-12-15", batchNo: "BATCH050", supplier: "MediSupply", minStock: 85 },
    { id: "m51", name: "Metoprolol", dosage: "25mg", quantity: 140, price: 125, expiryDate: "2026-11-10", batchNo: "BATCH051", supplier: "HealthCare Ltd", minStock: 70 },
    { id: "m52", name: "Propranolol", dosage: "40mg", quantity: 130, price: 105, expiryDate: "2026-10-30", batchNo: "BATCH052", supplier: "CardioMed", minStock: 65 },
    { id: "m53", name: "Atorvastatin", dosage: "10mg", quantity: 190, price: 95, expiryDate: "2026-12-20", batchNo: "BATCH053", supplier: "PharmaCorp", minStock: 95 },
    { id: "m54", name: "Rosuvastatin", dosage: "20mg", quantity: 160, price: 140, expiryDate: "2026-12-01", batchNo: "BATCH054", supplier: "MediLife", minStock: 80 },
    { id: "m55", name: "Clopidogrel", dosage: "75mg", quantity: 120, price: 165, expiryDate: "2026-10-15", batchNo: "BATCH055", supplier: "MediSupply", minStock: 60 },
    { id: "m56", name: "Warfarin", dosage: "5mg", quantity: 100, price: 180, expiryDate: "2026-09-30", batchNo: "BATCH056", supplier: "HealthCare Ltd", minStock: 50 },
    { id: "m57", name: "Furosemide", dosage: "40mg", quantity: 150, price: 75, expiryDate: "2026-11-25", batchNo: "BATCH057", supplier: "CardioMed", minStock: 75 },
    { id: "m58", name: "Spironolactone", dosage: "25mg", quantity: 140, price: 130, expiryDate: "2026-12-10", batchNo: "BATCH058", supplier: "PharmaCorp", minStock: 70 },
    { id: "m59", name: "Nitroglycerin", dosage: "0.5mg", quantity: 80, price: 220, expiryDate: "2026-08-20", batchNo: "BATCH059", supplier: "MediLife", minStock: 40 },
    { id: "m60", name: "Digoxin", dosage: "0.25mg", quantity: 110, price: 145, expiryDate: "2026-10-05", batchNo: "BATCH060", supplier: "MediSupply", minStock: 55 },

    // Gastrointestinal (10)
    { id: "m61", name: "Pantoprazole", dosage: "40mg", quantity: 180, price: 85, expiryDate: "2026-12-20", batchNo: "BATCH061", supplier: "HealthCare Ltd", minStock: 90 },
    { id: "m62", name: "Omeprazole", dosage: "20mg", quantity: 160, price: 75, expiryDate: "2026-12-15", batchNo: "BATCH062", supplier: "CardioMed", minStock: 80 },
    { id: "m63", name: "Rabeprazole", dosage: "20mg", quantity: 140, price: 95, expiryDate: "2026-11-30", batchNo: "BATCH063", supplier: "PharmaCorp", minStock: 70 },
    { id: "m64", name: "Domperidone", dosage: "10mg", quantity: 170, price: 65, expiryDate: "2026-12-01", batchNo: "BATCH064", supplier: "MediLife", minStock: 85 },
    { id: "m65", name: "Ondansetron", dosage: "4mg", quantity: 150, price: 120, expiryDate: "2026-11-10", batchNo: "BATCH065", supplier: "MediSupply", minStock: 75 },
    { id: "m66", name: "Loperamide", dosage: "2mg", quantity: 160, price: 55, expiryDate: "2026-12-25", batchNo: "BATCH066", supplier: "HealthCare Ltd", minStock: 80 },
    { id: "m67", name: "Lactulose", dosage: "10ml", quantity: 140, price: 45, expiryDate: "2026-11-20", batchNo: "BATCH067", supplier: "CardioMed", minStock: 70 },
    { id: "m68", name: "Sucralfate", dosage: "1g", quantity: 130, price: 110, expiryDate: "2026-10-30", batchNo: "BATCH068", supplier: "PharmaCorp", minStock: 65 },
    { id: "m69", name: "Dicyclomine", dosage: "20mg", quantity: 120, price: 70, expiryDate: "2026-11-15", batchNo: "BATCH069", supplier: "MediLife", minStock: 60 },
    { id: "m70", name: "Simethicone", dosage: "80mg", quantity: 150, price: 50, expiryDate: "2026-12-10", batchNo: "BATCH070", supplier: "MediSupply", minStock: 75 },

    // Respiratory (10)
    { id: "m71", name: "Salbutamol", dosage: "2mg", quantity: 140, price: 55, expiryDate: "2026-11-30", batchNo: "BATCH071", supplier: "HealthCare Ltd", minStock: 70 },
    { id: "m72", name: "Salbutamol", dosage: "100mcg", quantity: 160, price: 180, expiryDate: "2026-12-15", batchNo: "BATCH072", supplier: "CardioMed", minStock: 80 },
    { id: "m73", name: "Montelukast", dosage: "10mg", quantity: 130, price: 165, expiryDate: "2026-11-20", batchNo: "BATCH073", supplier: "PharmaCorp", minStock: 65 },
    { id: "m74", name: "Budesonide", dosage: "200mcg", quantity: 120, price: 250, expiryDate: "2026-10-25", batchNo: "BATCH074", supplier: "MediLife", minStock: 60 },
    { id: "m75", name: "Formoterol", dosage: "12mcg", quantity: 110, price: 280, expiryDate: "2026-10-30", batchNo: "BATCH075", supplier: "MediSupply", minStock: 55 },
    { id: "m76", name: "Dextromethorphan", dosage: "10mg", quantity: 180, price: 60, expiryDate: "2026-12-20", batchNo: "BATCH076", supplier: "HealthCare Ltd", minStock: 90 },
    { id: "m77", name: "Ambroxol", dosage: "30mg", quantity: 150, price: 70, expiryDate: "2026-12-01", batchNo: "BATCH077", supplier: "CardioMed", minStock: 75 },
    { id: "m78", name: "Bromhexine", dosage: "8mg", quantity: 140, price: 65, expiryDate: "2026-11-15", batchNo: "BATCH078", supplier: "PharmaCorp", minStock: 70 },
    { id: "m79", name: "Guaifenesin", dosage: "100mg", quantity: 160, price: 50, expiryDate: "2026-12-10", batchNo: "BATCH079", supplier: "MediLife", minStock: 80 },
    { id: "m80", name: "Theophylline", dosage: "200mg", quantity: 130, price: 125, expiryDate: "2026-11-30", batchNo: "BATCH080", supplier: "MediSupply", minStock: 65 },

    // Antiallergic (5)
    { id: "m81", name: "Cetirizine", dosage: "10mg", quantity: 200, price: 45, expiryDate: "2026-12-31", batchNo: "BATCH081", supplier: "HealthCare Ltd", minStock: 100 },
    { id: "m82", name: "Levocetirizine", dosage: "5mg", quantity: 180, price: 55, expiryDate: "2026-12-25", batchNo: "BATCH082", supplier: "CardioMed", minStock: 90 },
    { id: "m83", name: "Loratadine", dosage: "10mg", quantity: 160, price: 50, expiryDate: "2026-12-20", batchNo: "BATCH083", supplier: "PharmaCorp", minStock: 80 },
    { id: "m84", name: "Fexofenadine", dosage: "120mg", quantity: 140, price: 75, expiryDate: "2026-11-30", batchNo: "BATCH084", supplier: "MediLife", minStock: 70 },
    { id: "m85", name: "Diphenhydramine", dosage: "25mg", quantity: 150, price: 60, expiryDate: "2026-12-15", batchNo: "BATCH085", supplier: "MediSupply", minStock: 75 },

    // Vitamins & Supplements (5)
    { id: "m86", name: "Vitamin C", dosage: "500mg", quantity: 300, price: 35, expiryDate: "2026-12-31", batchNo: "BATCH086", supplier: "HealthCare Ltd", minStock: 150 },
    { id: "m87", name: "Vitamin D3", dosage: "60000IU", quantity: 200, price: 85, expiryDate: "2026-11-30", batchNo: "BATCH087", supplier: "CardioMed", minStock: 100 },
    { id: "m88", name: "Calcium Carbonate", dosage: "500mg", quantity: 220, price: 55, expiryDate: "2026-12-20", batchNo: "BATCH088", supplier: "PharmaCorp", minStock: 110 },
    { id: "m89", name: "Iron", dosage: "100mg", quantity: 180, price: 70, expiryDate: "2026-12-10", batchNo: "BATCH089", supplier: "MediLife", minStock: 90 },
    { id: "m90", name: "Folic Acid", dosage: "5mg", quantity: 160, price: 45, expiryDate: "2026-12-25", batchNo: "BATCH090", supplier: "MediSupply", minStock: 80 },

    // Dermatology (5)
    { id: "m91", name: "Clotrimazole", dosage: "1%", quantity: 120, price: 85, expiryDate: "2026-10-30", batchNo: "BATCH091", supplier: "HealthCare Ltd", minStock: 60 },
    { id: "m92", name: "Ketoconazole", dosage: "2%", quantity: 100, price: 95, expiryDate: "2026-11-15", batchNo: "BATCH092", supplier: "CardioMed", minStock: 50 },
    { id: "m93", name: "Hydrocortisone", dosage: "1%", quantity: 110, price: 75, expiryDate: "2026-12-01", batchNo: "BATCH093", supplier: "PharmaCorp", minStock: 55 },
    { id: "m94", name: "Benzoyl Peroxide", dosage: "5%", quantity: 140, price: 105, expiryDate: "2026-11-20", batchNo: "BATCH094", supplier: "MediLife", minStock: 70 },
    { id: "m95", name: "Permethrin", dosage: "5%", quantity: 90, price: 125, expiryDate: "2026-10-10", batchNo: "BATCH095", supplier: "MediSupply", minStock: 45 },

    // CNS / Psychiatry (10)
    { id: "m96", name: "Diazepam", dosage: "5mg", quantity: 130, price: 155, expiryDate: "2026-11-30", batchNo: "BATCH096", supplier: "HealthCare Ltd", minStock: 65 },
    { id: "m97", name: "Alprazolam", dosage: "0.5mg", quantity: 120, price: 165, expiryDate: "2026-12-10", batchNo: "BATCH097", supplier: "CardioMed", minStock: 60 },
    { id: "m98", name: "Clonazepam", dosage: "0.5mg", quantity: 100, price: 175, expiryDate: "2026-11-20", batchNo: "BATCH098", supplier: "PharmaCorp", minStock: 50 },
    { id: "m99", name: "Fluoxetine", dosage: "20mg", quantity: 140, price: 185, expiryDate: "2026-12-15", batchNo: "BATCH099", supplier: "MediLife", minStock: 70 },
    { id: "m100", name: "Sertraline", dosage: "50mg", quantity: 150, price: 210, expiryDate: "2026-12-01", batchNo: "BATCH100", supplier: "MediSupply", minStock: 75 },
    { id: "m101", name: "Escitalopram", dosage: "10mg", quantity: 130, price: 195, expiryDate: "2026-11-25", batchNo: "BATCH101", supplier: "HealthCare Ltd", minStock: 65 },
    { id: "m102", name: "Amitriptyline", dosage: "25mg", quantity: 110, price: 155, expiryDate: "2026-10-30", batchNo: "BATCH102", supplier: "CardioMed", minStock: 55 },
    { id: "m103", name: "Gabapentin", dosage: "300mg", quantity: 120, price: 145, expiryDate: "2026-11-15", batchNo: "BATCH103", supplier: "PharmaCorp", minStock: 60 },
    { id: "m104", name: "Pregabalin", dosage: "75mg", quantity: 100, price: 165, expiryDate: "2026-12-05", batchNo: "BATCH104", supplier: "MediLife", minStock: 50 },
    { id: "m105", name: "Zolpidem", dosage: "10mg", quantity: 140, price: 175, expiryDate: "2026-12-20", batchNo: "BATCH105", supplier: "MediSupply", minStock: 70 },

    // LOW STOCK ITEMS (Alert needed)
    { id: "m106", name: "Penicillin V", dosage: "250mg", quantity: 8, price: 95, expiryDate: "2026-09-15", batchNo: "BATCH106", supplier: "PharmaCorp", minStock: 50 },
    { id: "m107", name: "Erythromycin", dosage: "250mg", quantity: 12, price: 105, expiryDate: "2026-10-20", batchNo: "BATCH107", supplier: "MediLife", minStock: 60 },
    { id: "m108", name: "Norfloxacin", dosage: "400mg", quantity: 15, price: 88, expiryDate: "2026-11-30", batchNo: "BATCH108", supplier: "HealthCare Ltd", minStock: 75 },
    { id: "m109", name: "Moxifloxacin", dosage: "400mg", quantity: 18, price: 185, expiryDate: "2026-12-10", batchNo: "BATCH109", supplier: "CardioMed", minStock: 80 },
    { id: "m110", name: "Ampicillin", dosage: "250mg", quantity: 20, price: 65, expiryDate: "2026-10-15", batchNo: "BATCH110", supplier: "PharmaCorp", minStock: 90 },

    // EXPIRING SOON (30 days or less)
    { id: "m111", name: "Cefotaxime", dosage: "500mg", quantity: 110, price: 320, expiryDate: "2026-05-15", batchNo: "BATCH111", supplier: "MediSupply", minStock: 60 },
    { id: "m112", name: "Streptomycin", dosage: "1g", quantity: 45, price: 280, expiryDate: "2026-05-20", batchNo: "BATCH112", supplier: "HealthCare Ltd", minStock: 30 },
    { id: "m113", name: "Tobramycin", dosage: "80mg", quantity: 65, price: 350, expiryDate: "2026-05-10", batchNo: "BATCH113", supplier: "CardioMed", minStock: 40 },
    { id: "m114", name: "Isoniazid", dosage: "300mg", quantity: 95, price: 55, expiryDate: "2026-05-18", batchNo: "BATCH114", supplier: "PharmaCorp", minStock: 50 },
    { id: "m115", name: "Pyrazinamide", dosage: "500mg", quantity: 120, price: 65, expiryDate: "2026-05-25", batchNo: "BATCH115", supplier: "MediLife", minStock: 70 },
  ]);

  const [pendingPrescriptions] = useState<PendingPrescription[]>([
    {
      id: "px1",
      patientName: "Priya Sharma",
      prescriptionDate: new Date(2026, 3, 23).toISOString(),
      medicines: [
        { name: "Aspirin", dosage: "500mg", quantity: 10 },
        { name: "Amoxicillin", dosage: "250mg", quantity: 7 },
      ],
      status: "pending",
    },
    {
      id: "px2",
      patientName: "Amit Patel",
      prescriptionDate: new Date(2026, 3, 22).toISOString(),
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
