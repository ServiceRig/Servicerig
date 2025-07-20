
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CustomerLinkedRecords as RecordsType } from "@/lib/types";
import { FileText, Calculator, FileDiff, ClipboardCheck, PiggyBank } from "lucide-react";
import Link from "next/link";

const recordItems = [
    { key: 'invoices', label: 'Invoices', icon: FileText, href: '#' },
    { key: 'estimates', label: 'Estimates', icon: Calculator, href: '#' },
    { key: 'deposits', label: 'Deposits', icon: PiggyBank, href: '#' },
    { key: 'purchaseOrders', label: 'Purchase Orders', icon: FileDiff, href: '#' },
    { key: 'completedForms', label: 'Completed Forms', icon: ClipboardCheck, href: '#' },
]

export function CustomerLinkedRecords({ records }: { records: RecordsType }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Linked Records</CardTitle>
        <CardDescription>Associated documents and forms.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {recordItems.map(item => {
            const count = records[item.key as keyof RecordsType];
            return (
                <Link key={item.key} href={item.href} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                    <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">{count > 0 ? count : 'None'}</span>
                </Link>
            )
        })}
      </CardContent>
    </Card>
  );
}
