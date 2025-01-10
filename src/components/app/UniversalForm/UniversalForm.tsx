'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Path, useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import type { UniversalFormProps } from './types';
import SubmitButton from '../SubmitButton/SubmitButton';
import { useActionState } from 'react';
import React from 'react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { accountSchema, commentSchema, uploadSchema } from '@/lib/form/zod';

export const schemaDb = [
  { name: 'login', zod: accountSchema },
  { name: 'register', zod: accountSchema },
  { name: 'upload', zod: uploadSchema },
  { name: 'comment', zod: commentSchema },
] as const;

export function UniversalForm<T extends z.ZodType>({
  fields,
  schemaName,
  action,
  onActionComplete,
  defaultValues,
  submitText = 'Submit',
  submitClassname,
  otherSubmitButton,
  submitButtonDivClassname,
  resetFormOnSubmit,
}: UniversalFormProps<T>) {
  // @ts-ignore idk why this error is happening, first apprearing on the react 19 update.
  const [state, formAction] = useActionState<{ success: boolean; error?: string }>(action, null);
  const schema = schemaDb.find((s) => s.name === schemaName)?.zod;
  const formRef = React.useRef<HTMLFormElement>(null);

  if (!schema) {
    throw new Error(`Schema "${schemaName}" not found`);
  }

  // Initialize default values for all fields
  const initialValues = React.useMemo(() => {
    const values: Record<string, any> = {};
    fields.forEach((field) => {
      values[field.name] = field.value ?? ''; // Use empty string as fallback
    });
    return { ...values, ...defaultValues };
  }, [fields, defaultValues]);

  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: initialValues as z.infer<T>,
  });

  React.useEffect(() => {
    if (state?.success && resetFormOnSubmit) {
      form.reset(initialValues as z.infer<T>);
    }
  }, [state, resetFormOnSubmit, form, initialValues]);

  React.useEffect(() => {
    if (state && !state.success) {
      toast.error(state.error);
    }
    if (state) {
      onActionComplete?.(state);
    }
  }, [state, onActionComplete]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-2" ref={formRef}>
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as Path<z.infer<T>>}
            render={({ field: formField }) => (
              <FormItem>
                {field.type !== 'hidden' && !field.hiddenShowLabel && (
                  <FormLabel>{field.label}</FormLabel>
                )}
                <FormControl>
                  <div>
                    {field.textArea ? (
                      <Textarea
                        placeholder={field.placeholder}
                        {...formField}
                        value={formField.value ?? ''}
                        rows={field.textAreaRows ?? 5}
                        required={field.required}
                      />
                    ) : (
                      <Input
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        {...formField}
                        value={formField.value ?? ''}
                        required={field.required}
                      />
                    )}
                    {field.customComponent && field.customComponent}
                  </div>
                </FormControl>
                {field.description && <FormDescription>{field.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className={cn('flex gap-2 py-2', submitButtonDivClassname)}>
          {otherSubmitButton}
          <SubmitButton buttonText={submitText} className={submitClassname} />
        </div>
      </form>
    </Form>
  );
}
