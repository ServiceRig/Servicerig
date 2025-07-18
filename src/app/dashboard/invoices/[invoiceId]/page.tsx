export default async function InvoiceDetailsPage({ params }: { params: { invoiceId: string } }) {
  const invoiceId = params.invoiceId;

  // In a real app, you would fetch the invoice data from Firestore here.
  // const invoice = await getInvoiceById(invoiceId);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold">Invoice Details</h1>
      <p className="text-muted-foreground mt-2">Invoice ID: {invoiceId}</p>
      <div className="mt-6 p-8 bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Invoice details page coming soon...</p>
      </div>
    </div>
  );
}
