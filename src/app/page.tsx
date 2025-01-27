
import dynamic from 'next/dynamic';
import '@/components/css/map.css'
const MainContainer = dynamic(() => import('@/components/tools/main_container'), {ssr: true})
export default function Home() {

  
  return (
   <MainContainer/>
  );
}
