"use client";
import * as React from "react";
import { motion, useMotionValue, AnimatePresence } from "motion/react";
import { Linkedin, Github, Dribbble, Figma, User } from "lucide-react";
import { useAuth, SignInButton, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { checkOnboardingStatus } from "../../lib/supabase-onboarding";
import { supabase } from '../../lib/supabaseClient';

interface iNavItem {
	heading: string;
	href: string;
	subheading?: string;
	imgSrc?: string;
}

interface iNavLinkProps extends iNavItem {
	setIsActive: (isActive: boolean) => void;
	index: number;
}

interface iCurvedNavbarProps {
	setIsActive: (isActive: boolean) => void;
	navItems: iNavItem[];
}

interface iHeaderProps {
	navItems?: iNavItem[];
	footer?: React.ReactNode;
	invert?: boolean;
}

const MENU_SLIDE_ANIMATION = {
	initial: { x: "calc(100% + 100px)" },
	enter: { x: "0", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } },
	exit: {
		x: "calc(100% + 100px)",
		transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
	},
};

const defaultNavItems: iNavItem[] = [
	{
		heading: "Accueil",
		href: "#",
		subheading: "Bienvenue sur notre site",
	},
	{
		heading: "Solutions",
		href: "#link",
		subheading: "Découvrez nos produits IA",
	},
	{
		heading: "Tarifs",
		href: "/pricing",
		subheading: "Nos offres et plans",
	},
	{
		heading: "À Propos",
		href: "/about",
		subheading: "Notre mission et vision",
	},
];

const CustomFooter: React.FC = () => {
	return (
		<div className="flex w-full text-sm justify-between text-white px-10 md:px-24 py-5 border-t border-white/10 mt-auto">
			<a href="#" className="hover:text-[#2EB9DF] transition-colors">
				<Linkedin size={24} />
			</a>
			<a href="#" className="hover:text-[#2EB9DF] transition-colors">
				<Github size={24} />
			</a>
			<a href="#" className="hover:text-[#2EB9DF] transition-colors">
				<Dribbble size={24} />
			</a>
			<a href="#" className="hover:text-[#2EB9DF] transition-colors">
				<Figma size={24} />
			</a>
		</div>
	);
};

const NavLink: React.FC<iNavLinkProps> = ({
	heading,
	href,
	setIsActive,
	index,
}) => {
	const ref = React.useRef<HTMLAnchorElement | null>(null);

	const handleClick = () => {
		setIsActive(false);
	};

	return (
		<motion.div
			onClick={handleClick}
			initial="initial"
			whileHover="whileHover"
			className="group relative flex items-center justify-between border-b border-white/5 py-3 transition-colors duration-500 uppercase overflow-hidden"
		>
			<a ref={ref} href={href} className="w-full">
				<div className="relative flex items-center">
					<span className="text-white/20 transition-colors duration-500 text-xl font-thin mr-6">
						{index < 10 ? `0${index}` : index}.
					</span>
					<motion.span
						variants={{
							initial: { x: 0 },
							whileHover: { x: 12 },
						}}
						transition={{
							type: "spring",
							staggerChildren: 0.05,
							delayChildren: 0.1,
						}}
						className="relative z-10 block text-2xl font-thin text-white transition-all duration-500 md:text-3xl tracking-tighter"
					>
						{heading.split("").map((letter, i) => {
							return (
								<motion.span
									key={i}
									variants={{
										initial: { x: 0 },
										whileHover: { x: 8 },
									}}
									transition={{ type: "spring", stiffness: 200, damping: 10 }}
									className="inline-block"
								>
									{letter === " " ? "\u00A0" : letter}
								</motion.span>
							);
						})}
					</motion.span>
				</div>
			</a>
		</motion.div>
	);
};

const Curve: React.FC = () => {
    const [path, setPath] = React.useState("");

    React.useEffect(() => {
        const initialPath = `M100 0 L200 0 L200 ${window.innerHeight} L100 ${window.innerHeight} Q-100 ${window.innerHeight / 2} 100 0`;
        const targetPath = `M100 0 L200 0 L200 ${window.innerHeight} L100 ${window.innerHeight} Q100 ${window.innerHeight / 2} 100 0`;
        setPath(targetPath);
    }, []);

	const curve = {
		initial: { d: `M100 0 L200 0 L200 ${typeof window !== 'undefined' ? window.innerHeight : 1000} L100 ${typeof window !== 'undefined' ? window.innerHeight : 1000} Q-100 ${typeof window !== 'undefined' ? window.innerHeight / 2 : 500} 100 0` },
		enter: {
			d: `M100 0 L200 0 L200 ${typeof window !== 'undefined' ? window.innerHeight : 1000} L100 ${typeof window !== 'undefined' ? window.innerHeight : 1000} Q100 ${typeof window !== 'undefined' ? window.innerHeight / 2 : 500} 100 0`,
			transition: { duration: 1, ease: [0.76, 0, 0.24, 1] },
		},
		exit: {
			d: `M100 0 L200 0 L200 ${typeof window !== 'undefined' ? window.innerHeight : 1000} L100 ${typeof window !== 'undefined' ? window.innerHeight : 1000} Q-100 ${typeof window !== 'undefined' ? window.innerHeight / 2 : 500} 100 0`,
			transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
		},
	};

	return (
		<svg
			className="absolute top-0 -left-[99px] w-[100px] stroke-none h-full"
			style={{ fill: "#000000" }}
		>
			<motion.path
				variants={curve}
				initial="initial"
				animate="enter"
				exit="exit"
			/>
		</svg>
	);
};

const CurvedNavbar: React.FC<
	iCurvedNavbarProps & { footer?: React.ReactNode }
> = ({ setIsActive, navItems, footer }) => {
	return (
		<motion.div
			variants={MENU_SLIDE_ANIMATION}
			initial="initial"
			animate="enter"
			exit="exit"
			className="h-full w-full max-w-screen-sm fixed right-0 top-0 z-40 bg-[#000000] border-l border-white/5"
		>
			<div className="h-full pt-16 flex flex-col justify-between">
				<div className="flex flex-col gap-6 px-10 md:px-24">
					<div className="text-white/40 border-b border-white/10 uppercase text-[10px] pb-4 tracking-[0.3em] font-black">
						<p>Menu de Navigation</p>
					</div>
					<section className="bg-transparent">
						<div className="mx-auto max-w-7xl flex flex-col">
							{navItems.map((item, index) => {
								return (
									<NavLink
										key={item.href + index}
										{...item}
										setIsActive={setIsActive}
										index={index + 1}
									/>
								);
							})}
						</div>
					</section>
				</div>
				{footer}
			</div>
			<Curve />
		</motion.div>
	);
};

const CurvedMenuHeader: React.FC<iHeaderProps> = (props) => {
	const hasClerkKey = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

	if (hasClerkKey) {
		return <CurvedMenuHeaderInternal {...props} />;
	}

	return <CurvedMenuHeaderBase {...props} />;
};

const CurvedMenuHeaderInternal: React.FC<iHeaderProps> = (props) => {
	const { isSignedIn, userId } = useAuth();
	return <CurvedMenuHeaderBase {...props} auth={{ isSignedIn, userId }} />;
};

const CurvedMenuHeaderBase: React.FC<iHeaderProps & { auth?: { isSignedIn: boolean | undefined; userId: string | null | undefined } }> = ({
	navItems = defaultNavItems,
	footer = <CustomFooter />,
	invert = false,
	auth
}) => {
	const [isActive, setIsActive] = React.useState(false);
	const navigate = useNavigate();
	const isSignedIn = auth?.isSignedIn;
	const userId = auth?.userId;
	const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (!userId) return;
		supabase
			.from('user_profiles')
			.select('photo_url')
			.eq('id', userId)
			.single()
			.then(({ data }) => {
				if (data?.photo_url) setAvatarUrl(data.photo_url);
			});
	}, [userId]);

	const { openSignIn } = useClerk();
	const handleProfileClick = async () => {
  if (!isSignedIn || !userId) {
    openSignIn();
    return;
  }

  // Attendre que Clerk soit complètement chargé
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const completed = await checkOnboardingStatus(userId);
    if (completed === true) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  } catch {
    navigate('/dashboard');
  }
};

	return (
		<>
			<div className="fixed top-0 left-0 w-full z-[60] flex justify-between items-center p-6 md:p-8 pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
					{/* Logo area or other left elements can go here */}
                </div>
				<div className="flex items-center gap-4 pointer-events-auto">
					{auth ? (
						isSignedIn ? (
							<button 
								onClick={handleProfileClick}
								className="rounded-full border transition-all duration-300 bg-white/5 border-white/10 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-white/30"
								style={{ width: 44, height: 44, padding: 0 }}
							>
								{avatarUrl ? (
									<img 
										src={avatarUrl} 
										alt="Profil"
										className="w-full h-full object-cover rounded-full"
									/>
								) : (
									<User size={20} className="text-white" />
								)}
							</button>
						) : (
							<SignInButton mode="modal" forceRedirectUrl="/onboarding">
								<button className={`p-2 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300`}>
									<User size={20} />
								</button>
							</SignInButton>
						)
					) : (
						<button className={`p-2 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300`}>
							<User size={20} />
						</button>
					)}
					<div
						onClick={() => setIsActive(!isActive)}
						className="group relative flex items-center justify-center cursor-pointer overflow-hidden p-6"
					>
						<div className="flex flex-col justify-between items-end gap-1.5 transition-all duration-300">
							<span
								className={`block h-0.5 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${invert && !isActive ? "bg-black" : "bg-white"} ${isActive ? "w-8 rotate-45 translate-y-[5px]" : "w-8"}`}
							></span>
							<span
								className={`block h-0.5 bg-[#2EB9DF] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${isActive ? "w-0 opacity-0" : "w-6"}`}
							></span>
							<span
								className={`block h-0.5 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${invert && !isActive ? "bg-black" : "bg-white"} ${isActive ? "w-8 -rotate-45 -translate-y-[5px]" : "w-4 group-hover:w-8"}`}
							></span>
						</div>
					</div>
				</div>
			</div>

			<AnimatePresence mode="wait">
				{isActive && (
					<CurvedNavbar
						setIsActive={setIsActive}
						navItems={navItems}
						footer={footer}
					/>
				)}
			</AnimatePresence>
		</>
	);
};

export default CurvedMenuHeader;
