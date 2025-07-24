

import { Button } from "@/components/ui/button";
import { Customer } from "@/lib/types";
import { Mail, Phone, MapPin, Pencil, AlertTriangle, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const getTagStyles = (tag: string) => {
    switch (tag) {
        case 'High Churn Risk': return 'bg-red-100 text-red-800 border-red-200';
        case 'Frequent No-Show': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Recent Issue': return 'bg-orange-100 text-orange-800 border-orange-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

export function CustomerHeader({ customer }: { customer: Customer }) {
  const fullAddress = `${customer.companyInfo.address.street}, ${customer.companyInfo.address.city}, ${customer.companyInfo.address.state} ${customer.companyInfo.address.zipCode}`;
  
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
      <div className="space-y-4 flex-grow">
        <div className="flex items-start gap-4">
            <div>
                 <h1 className="text-3xl font-bold flex items-center gap-3">
                    {customer.primaryContact.firstName} {customer.primaryContact.lastName}
                    {customer.hasOpenInvoices && <Badge variant="destructive">Unpaid Invoices</Badge>}
                </h1>
                <p className="text-lg text-muted-foreground">{customer.companyInfo.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${customer.primaryContact.email}`} className="hover:underline">
                        {customer.primaryContact.email}
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${customer.primaryContact.phone}`} className="hover:underline">
                        {customer.primaryContact.phone}
                        </a>
                    </div>
                </div>
                 {customer.smartTags && customer.smartTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {customer.smartTags.map(tag => (
                            <Badge key={tag} variant="outline" className={getTagStyles(tag)}>
                                <AlertTriangle className="h-3 w-3 mr-1.5"/>
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
        
        <div className="flex items-start gap-4 text-sm text-muted-foreground">
             <MapPin className="h-5 w-5 mt-1" />
            <div>
                 <p>{fullAddress}</p>
                 <Image 
                    src="https://placehold.co/400x200.png"
                    data-ai-hint="map usa"
                    alt="Map of customer location"
                    width={400}
                    height={200}
                    className="mt-2 rounded-md border"
                />
            </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0">
          <Button variant="outline" className="justify-start">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <a href={`tel:${customer.primaryContact.phone}`}>
                <Phone className="mr-2 h-4 w-4" /> Call Customer
            </a>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <a href={`sms:${customer.primaryContact.phone}`}>
                <MessageSquare className="mr-2 h-4 w-4" /> Text Customer
            </a>
          </Button>
      </div>
    </div>
  );
}
