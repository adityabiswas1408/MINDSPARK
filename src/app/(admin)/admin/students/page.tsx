import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/shared/empty-state';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function AdminStudentsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const statusParam = searchParams.status === 'active' ? 'active' : undefined;
  
  const supabase = await createClient();
  let query = supabase.from('students').select('*');
  
  if (statusParam === 'active') {
     query = query.is('deleted_at', null);
  }

  const { data: students } = await query.limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-800">Students</h1>
        <Button>Import Students</Button>
      </div>
      
      {!students || students.length === 0 ? (
        <div className="max-w-xl mx-auto mt-12">
          <EmptyState 
            icon={<Users size={48} />}
            title="No Students Found"
            description="Import students via CSV to begin."
            action={<Button variant="outline">Download Template</Button>}
          />
        </div>
      ) : (
        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-primary font-medium">{student.roll_number}</TableCell>
                  <TableCell>{student.full_name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.deleted_at ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-800'}`}>
                      {student.deleted_at ? 'Inactive' : 'Active'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
