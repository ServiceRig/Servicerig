
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Customer } from "@/lib/types";
import { Mail, Phone, MapPin, User, Clock, Route, FileText, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string }) => (
    <div>
        <Label className="text-xs text-muted-foreground flex items-center gap-2"><Icon className="h-3 w-3" /> {label}</Label>
        <p className="text-sm font-medium">{value || 'N/A'}</p>
    </div>
);

export function CustomerInfoPanel({ customer }: { customer: Customer }) {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
             <InfoItem icon={User} label="Primary Contact" value={customer.primaryContact.name} />
             <InfoItem icon={Mail} label="Email" value={customer.primaryContact.email} />
             <InfoItem icon={Phone} label="Phone" value={customer.primaryContact.phone} />
        </div>
        <Separator />
         <div className="space-y-2">
            <InfoItem icon={MapPin} label="Service Address" value={`${customer.companyInfo.address.street}, ${customer.companyInfo.address.city}, ${customer.companyInfo.address.state}`} />
        </div>
        <Separator />
        <div className="space-y-2">
            <InfoItem icon={Clock} label="Preferred Service Times" value="Weekdays, Mornings" />
            <InfoItem icon={Route} label="Preferred Technician" value="John Doe" />
        </div>
        <Separator />
        <div className="space-y-2">
            <InfoItem icon={FileText} label="Payment Terms" value="Net 30" />
            <InfoItem icon={Globe} label="Acquisition Source" value="Google Search" />
        </div>
      </CardContent>
    </Card>
  );
}
