import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <Card className="backdrop-blur-md bg-card/60 border-primary/20">
        <CardHeader>
          <CardTitle className="font-heading text-4xl">Metis Command Center</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-body">
             System Online. AI Core Initialized.
             <br />
             Waiting for task delegation...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
