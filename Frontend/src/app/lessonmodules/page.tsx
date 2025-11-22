"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const RedirectToLearn: React.FC = () => {
  const router = useRouter();
  useEffect(() => { router.replace('/learn'); }, [router]);
  return null;
};

export default RedirectToLearn;
