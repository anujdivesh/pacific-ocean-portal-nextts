"use client";
import dynamic from 'next/dynamic';
import '@/components/css/mapmain.css';

// Dynamically import MainContainer with SSR disabled
const MainContainer = dynamic(() => import('@/components/tools/main_container'), {
  ssr: false, // Ensure this component is only loaded on the client side
});

export default function Home() {
  return (
    <MainContainer />
  );
}