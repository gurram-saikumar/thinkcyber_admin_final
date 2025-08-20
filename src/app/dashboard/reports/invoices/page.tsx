import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InvoicesPage() {
  return (
    <PageContainer>
      <div className='space-y-4'>
        <Breadcrumbs />
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Invoices Management</h1>
          <p className='text-muted-foreground'>Manage billing and invoice generation</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Invoice System</CardTitle>
            <CardDescription>Generate and manage customer invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-center py-10 text-muted-foreground'>Invoice management system will be implemented here</p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
