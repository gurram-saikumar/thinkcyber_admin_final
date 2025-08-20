import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EarningsReportPage() {
  return (
    <PageContainer>
      <div className='space-y-4'>
        <Breadcrumbs />
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Earnings Reports</h1>
          <p className='text-muted-foreground'>Track revenue and financial performance</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Detailed earnings and revenue analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-center py-10 text-muted-foreground'>Earnings reports and analytics will be implemented here</p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
