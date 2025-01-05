'use client';

import { UniversalForm } from '@/components/app/UniversalForm/UniversalForm';
import UploadFile from '@/components/app/UploadFile/UploadFile';
import { create } from '@/lib/form/actions';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-md w-full p-4">
        <UniversalForm
          fields={[
            {
              name: 'asdf',
              label: 'asdf',
              type: 'hidden',
              placeholder: 'asdf',
              customComponent: <UploadFile id="file" />,
            },
            {
              name: 'caption',
              label: 'Caption',
              type: 'text',
              placeholder: 'Caption',
              textArea: true,
            },
            {
              name: 'tags',
              label: 'Tags',
              type: 'text',
              placeholder: 'Tags',
              description: 'Separate tags with commas',
            },
          ]}
          schemaName="upload"
          action={create}
          submitText="Upload"
          submitClassname="w-full"
          onActionComplete={(res) => res.success && router.push(`/post/${res.id}`)}
        />
      </div>
    </div>
  );
}
