import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Activity, FileText, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsDashboard() {
  // Dynamic stats based on current date (April 23, 2026)
  const BASE_DATE = new Date(2026, 3, 23);
  const currentMonth = BASE_DATE.getMonth(); // April = 3
  
  // Calculate realistic stats for April 2026
  // This month should show only partial month (April 1-23)
  const thisMonthPatients = Math.floor(89 * (23 / 30)); // 68 patients (23 days into April)
  
  const stats = [
    { label: "Total Patients", value: "248", change: "+12%", trend: "up", icon: Users },
    { label: "This Month", value: thisMonthPatients.toString(), change: "+8%", trend: "up", icon: Activity },
    { label: "Prescriptions", value: "312", change: "+15%", trend: "up", icon: FileText },
    { label: "Recovery Rate", value: "89%", change: "+3%", trend: "up", icon: Heart },
  ];

  //todo: remove mock functionality
  const commonConditions = [
    { name: "Diabetes Type 2", count: 48, percentage: 19 },
    { name: "Hypertension", count: 42, percentage: 17 },
    { name: "Asthma", count: 28, percentage: 11 },
    { name: "Thyroid Disorders", count: 22, percentage: 9 },
    { name: "Arthritis", count: 18, percentage: 7 },
  ];

  // Generate realistic 12-month data from April 23, 2026 baseline
  const generateMonthlyData = () => {
    const currentDate = new Date(2026, 3, 23); // April 23, 2026 (TODAY)
    const months = [];
    
    // Realistic consultation data for 12 months (May 2025 → Apr 2026)
    const monthlyPatients = [
      { month: "May", year: 2025, patients: 42 },
      { month: "Jun", year: 2025, patients: 51 },
      { month: "Jul", year: 2025, patients: 48 },
      { month: "Aug", year: 2025, patients: 62 },
      { month: "Sep", year: 2025, patients: 74 },
      { month: "Oct", year: 2025, patients: 68 },
      { month: "Nov", year: 2025, patients: 89 },
      { month: "Dec", year: 2025, patients: 78 },
      { month: "Jan", year: 2026, patients: 92 },
      { month: "Feb", year: 2026, patients: 85 },
      { month: "Mar", year: 2026, patients: 98 },
      { month: "Apr", year: 2026, patients: 68 }, // April 1-23 (23 days)
    ];
    
    return monthlyPatients.map(d => ({
      month: d.month,
      year: d.year,
      patients: d.patients,
      displayLabel: `${d.month} '${d.year.toString().slice(2)}`
    }));
  };

  const monthlyData = generateMonthlyData();

  const maxPatients = Math.max(...monthlyData.map((d) => d.patients));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Insights and trends from your practice</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <div className={`flex items-center gap-1 text-sm ${stat.trend === "up" ? "text-green-600" : "text-destructive"}`}>
                    <TrendIcon className="w-4 h-4" />
                    <span>{stat.change}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Consultations Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{data.displayLabel}</span>
                    <span className="text-muted-foreground">{data.patients} patients</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(data.patients / maxPatients) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commonConditions.map((condition, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{idx + 1}</Badge>
                      <span className="font-medium">{condition.name}</span>
                    </div>
                    <span className="text-muted-foreground">{condition.count} patients</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-chart-2 rounded-full transition-all"
                      style={{ width: `${condition.percentage * 5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
            <p className="text-sm font-medium text-primary mb-1">Patient Growth Trend</p>
            <p className="text-sm">Your patient base has grown by 32% over the last 6 months. Consider expanding consultation hours.</p>
          </div>
          <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-lg">
            <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Seasonal Pattern Detected</p>
            <p className="text-sm">Respiratory conditions show a 45% increase in winter months. Stock relevant medications.</p>
          </div>
          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Recovery Success</p>
            <p className="text-sm">Patients with diabetes show better outcomes when follow-up frequency is increased to bi-weekly.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
