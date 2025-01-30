
"use client";
import dynamic from 'next/dynamic';
import '@/components/css/map.css'
//const MainContainer = dynamic(() => import('@/components/tools/main_container'), {ssr: false})

const MainContainer = dynamic(() => import('@/components/tools/main_container'));
export default function Home() {

  
  return (
   <MainContainer/>
  );
}
