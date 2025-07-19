
import { AiPriceGenerator } from "@/components/dashboard/ai-price-generator";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PriceBookPage() {
  return (
    <div className="space-y-6">
        <AiPriceGenerator />

        <Separator />

        <Card>
            <CardHeader>
                <CardTitle>Standard Services Catalog</CardTitle>
                <CardDescription>Manage your predefined services and flat-rate pricing.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground py-12">Standard Services Catalog coming soon...</p>
            </CardContent>
        </Card>
    </div>
    );
}
