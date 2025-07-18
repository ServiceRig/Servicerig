
import { Button } from "@/components/ui/button";
import { Customer } from "@/lib/types";
import { Mail, Phone, MapPin, Pencil } from "lucide-react";

export function CustomerHeader({ customer }: { customer: Customer }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">{customer.primaryContact.name}</h1>
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
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{customer.companyInfo.address}</span>
          </div>
        </div>
      </div>
      <Button variant="outline">
        <Pencil className="mr-2 h-4 w-4" />
        Edit Profile
      </Button>
    </div>
  );
}
