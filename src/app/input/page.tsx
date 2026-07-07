'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InputPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/input/paste');
  }, [router]);

  return null;
}
