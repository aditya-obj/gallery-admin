'use client';
import { usePathname } from 'next/navigation';
import NavBar from '@/components/NavBar';

export default function NavBarWrapper({ children }) {
  const pathname = usePathname();
  const hideNavBarPaths = ['/login', '/signup'];
  const shouldShowNavBar = !hideNavBarPaths.includes(pathname);

  return (
    <>
      {shouldShowNavBar && <NavBar />}
      {children}
    </>
  );
}