import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'safeText' })
export class SafeTextPipe implements PipeTransform {
  transform(value: any): string {
  // 1. Guard against null, undefined, or non-string types (fixes the crash)
  if (value === null || value === undefined) return '';
  
  // Ensure we are working with a string (converts numbers if necessary)
  const str = String(value);

  // 2. Perform HTML Entity Encoding
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
}
