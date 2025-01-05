import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UploadFile({ id }: { id: string }) {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor={id}>Image</Label>
      <Input id={id} type="file" name={id} />
    </div>
  );
}
