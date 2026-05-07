'use client';
import * as React from 'react';
import CurvedMenuHeader from './ui/curved-menu';
import { AutoslashLogo } from './ui/AutoslashLogo';
import { useLocation } from 'react-router-dom';

const navItems = [
	{
		heading: "Nos Offres",
		href: "/pricing",
	},
	{
		heading: "Projets",
		href: "/#projects",
	},
	{
		heading: "Article de blog",
		href: "/blog",
	},
	{
		heading: "AGENTS IA",
		href: "/agents-demo",
	},
	{
		heading: "À propos",
		href: "/about",
	},
	{
		heading: "Contact",
		href: "/contact",
	},
];

export function Header() {
  const [isProcessing, setIsProcessing] = React.useState(true);
  const location = useLocation();
  const isWhiteBgPage = location.pathname === "/contact" || location.pathname === "/elite-plan";

  React.useEffect(() => {
    const timer = setTimeout(() => setIsProcessing(false), 3000)
    return () => clearTimeout(timer)
  }, [])

	return (
        <>
            <div className="fixed top-0 left-0 z-[60] p-6 md:p-8 flex items-center gap-3">
                <a href="/" className="flex items-center hover:opacity-80 transition-opacity pointer-events-auto">
                    <AutoslashLogo className="h-10 w-auto" isProcessing={isProcessing} invert={isWhiteBgPage} />
                </a>
            </div>
            <CurvedMenuHeader 
                navItems={navItems} 
                footer={null}
                invert={isWhiteBgPage}
            />
        </>
	);
}
