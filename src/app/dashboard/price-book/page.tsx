
import { AiPriceGenerator } from "@/components/dashboard/ai-price-generator";
import { PricebookStandard } from "@/components/dashboard/pricebook-standard";
import { Separator } from "@/components/ui/separator";

export default function PriceBookPage() {
  return (
    <div className="space-y-6">
        <AiPriceGenerator />

        <Separator />

        <PricebookStandard />
    </div>
    );
}
