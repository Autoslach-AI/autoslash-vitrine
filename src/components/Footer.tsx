"use client";
import * as React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Dribbble,
  Globe,
} from "lucide-react";
import { FooterBackgroundGradient, TextHoverEffect } from "./ui/hover-footer";
import { AutoslashLogo } from "./ui/AutoslashLogo";

function Footer({ strokeColor = "#3ca2fa" }: { strokeColor?: string }) {
  // Footer link data
  const footerLinks = [
    {
      title: "Solutions",
      links: [
        { label: "AI Workflows", href: "#" },
        { label: "Automation", href: "#" },
        { label: "Data Pipeline", href: "#" },
        { label: "Enterprise", href: "#" },
      ],
    },
    {
      title: "Ressources",
      links: [
        { label: "Documentation", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Contact", href: "/contact" },
        {
          label: "Live Demo",
          href: "#",
          pulse: true,
        },
      ],
    },
  ];

  // Contact info data
  const contactInfo = [
    {
      icon: <Mail size={18} className="text-[#3ca2fa]" />,
      text: "hello@autoslash.ai",
      href: "mailto:hello@autoslash.ai",
    },
    {
      icon: <Phone size={18} className="text-[#3ca2fa]" />,
      text: "+33 1 23 45 67 89",
      href: "tel:+33123456789",
    },
    {
      icon: <MapPin size={18} className="text-[#3ca2fa]" />,
      text: "Paris, France",
    },
  ];

  // Social media icons
  const socialLinks = [
    { icon: <Facebook size={20} />, label: "Facebook", href: "#" },
    { icon: <Instagram size={20} />, label: "Instagram", href: "#" },
    { icon: <Twitter size={20} />, label: "Twitter", href: "#" },
    { icon: <Dribbble size={20} />, label: "Dribbble", href: "#" },
    { icon: <Globe size={20} />, label: "Globe", href: "#" },
  ];

  return (
    <footer className="bg-[#0F0F11]/10 relative h-fit rounded-3xl overflow-hidden m-8 mt-24">
      <div className="max-w-7xl mx-auto p-14 z-40 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
          {/* Brand section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <AutoslashLogo className="w-8 h-8" />
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              L'automatisation intelligente au service de votre croissance.
            </p>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-white text-lg font-semibold mb-6">
                {section.title}
              </h4>
              <ul className="space-y-3 text-white/60">
                {section.links.map((link) => (
                  <li key={link.label} className="relative">
                    <a
                      href={link.href}
                      className="hover:text-[#3ca2fa] transition-colors"
                    >
                      {link.label}
                    </a>
                    {link.pulse && (
                      <span className="absolute top-0 right-[-10px] w-2 h-2 rounded-full bg-[#3ca2fa] animate-pulse"></span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact section */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-6">
              Contact Us
            </h4>
            <ul className="space-y-4 text-white/60">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-center space-x-3">
                  {item.icon}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="hover:text-[#3ca2fa] transition-colors"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="hover:text-[#3ca2fa] transition-colors">
                      {item.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="border-t border-gray-800 my-8" />

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0">
          {/* Copyright */}
          <p className="text-center md:text-left text-white/60">
            &copy; {new Date().getFullYear()} AutoSlashAI. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* Text hover effect */}
      <div className="lg:flex hidden h-[30rem] -mt-52 -mb-36">
        <TextHoverEffect text="AUTOSLASH" className="z-50" strokeColor={strokeColor} />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}

export default Footer;
