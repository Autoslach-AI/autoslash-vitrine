import React, { useState, useEffect, useRef } from 'react';
import { OnboardingData } from '../../pages/onboarding';
import { countries } from 'countries-list';
import { AsYouType, getCountryCallingCode, CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';

interface Props {
  data: OnboardingData;
  onChange: (updated: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface CountryInfo {
  code: string;
  name: string;
  emoji: string;
  dialCode: string;
}

export default function OnboardingStep4({ data, onChange, onNext, onBack }: Props) {
  const isNextDisabled = !data.firstName.trim() || !data.lastName.trim() || !data.email.trim();
  const [selectedCountry, setSelectedCountry] = useState<string>('SN');
  const [countryList, setCountryList] = useState<CountryInfo[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [manualDialCode, setManualDialCode] = useState(false);

  useEffect(() => {
    // Prepare country list sorted alphabetically
    const list: CountryInfo[] = Object.entries(countries).map(([code, country]: [string, any]) => ({
      code,
      name: country.name,
      emoji: country.emoji,
      dialCode: Array.isArray(country.phone) ? country.phone[0].toString() : country.phone.toString(),
    })).sort((a, b) => a.name.localeCompare(b.name));
    setCountryList(list);

    // Auto-detect country
    const detectCountry = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const geo = await res.json();
        if (geo.country_code) {
          setSelectedCountry(geo.country_code);
        }
      } catch (err) {
        console.error('Country detection failed:', err);
      }
    };
    detectCountry();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePhoneChange = (value: string) => {
    // Remove non-digit except possibly a leading plus (though we handle prefix separately)
    const digits = value.replace(/[^\d]/g, '');
    
    // Format according to country
    const formatter = new AsYouType(selectedCountry as CountryCode);
    const formatted = formatter.input(digits);
    
    // Construct storage value: +(prefix) : formatted_number
    const prefix = getCountryCallingCode(selectedCountry as CountryCode);
    const finalValue = `+(${prefix}) : ${formatted}`;
    
    onChange({ phone: finalValue });
  };

  // Helper to extract only the number part for the input field display
  const getDisplayNumber = () => {
    if (!data.phone) return '';
    const parts = data.phone.split(' : ');
    return parts.length > 1 ? parts[1] : '';
  };

  const currentCountry = countryList.find(c => c.code === selectedCountry);

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-serif font-medium leading-tight tracking-tight">
          Comment vous appelle-t-on ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
          {data.need && `Besoin : "${data.need}"`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Prénom *</label>
          <input
            type="text"
            placeholder="Ex: Amadou"
            className="w-full bg-transparent border-b border-white/20 py-3 font-jakarta text-xl focus:border-white outline-none transition-colors placeholder:text-white/20"
            value={data.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Nom *</label>
          <input
            type="text"
            placeholder="Ex: Mbaye"
            className="w-full bg-transparent border-b border-white/20 py-3 font-jakarta text-xl focus:border-white outline-none transition-colors placeholder:text-white/20"
            value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Email professionnel *</label>
          <input
            type="email"
            placeholder="votre@email.com"
            className="w-full bg-transparent border-b border-white/20 py-3 font-jakarta text-xl focus:border-white outline-none transition-colors placeholder:text-white/20"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </div>
        
        {/* Smart Phone Input */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">
            Téléphone (optionnel)
          </label>
          <div className="flex items-end gap-4 relative" ref={dropdownRef}>
            {/* Country Selector */}
            <div className="relative group">
              {manualDialCode ? (
                <div className="flex items-center gap-1 border-b border-white/20 pb-2">
                  <span className="font-jakarta text-xl text-white/40">+</span>
                  <input
                    autoFocus
                    type="text"
                    className="w-12 bg-transparent font-jakarta text-xl outline-none"
                    placeholder="221"
                    onBlur={() => setManualDialCode(false)}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      // Find country with this dial code
                      const found = countryList.find(c => c.dialCode === val);
                      if (found) setSelectedCountry(found.code);
                    }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onDoubleClick={() => setManualDialCode(true)}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 border-b border-white/20 pb-3 transition-colors hover:border-white/40"
                >
                  <span className="text-2xl">{currentCountry?.emoji}</span>
                  <span className="font-jakarta text-xl">+{currentCountry?.dialCode}</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              {isDropdownOpen && !manualDialCode && (
                <div className="absolute top-full left-0 mt-2 w-72 max-h-60 overflow-y-auto bg-black border border-white/10 z-50 rounded-lg shadow-2xl backdrop-blur-xl">
                  {countryList.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        setSelectedCountry(country.code);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                    >
                      <span className="text-xl">{country.emoji}</span>
                      <span className="flex-1 font-jakarta text-sm text-white/80">{country.name}</span>
                      <span className="text-white/40 text-xs font-mono">+{country.dialCode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone Input */}
            <input
              type="tel"
              placeholder="77 000 00 00"
              className="flex-1 bg-transparent border-b border-white/20 py-3 font-jakarta text-xl focus:border-white outline-none transition-colors placeholder:text-white/20"
              value={getDisplayNumber()}
              onChange={(e) => handlePhoneChange(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Entreprise (optionnel)</label>
          <input
            type="text"
            placeholder="Nom de votre société"
            className="w-full bg-transparent border-b border-white/20 py-3 font-jakarta text-xl focus:border-white outline-none transition-colors placeholder:text-white/20"
            value={data.company}
            onChange={(e) => onChange({ company: e.target.value })}
          />
        </div>
      </div>

      <div className="pt-8 flex gap-4">
        <button
          onClick={onBack}
          className="px-10 py-4 rounded-full font-jakarta font-bold text-sm tracking-widest border border-white/20 text-white hover:border-white/50 transition-all active:scale-95"
        >
          ← RETOUR
        </button>
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className={`px-10 py-4 rounded-full font-jakarta font-bold text-sm tracking-widest transition-all duration-300 ${
            isNextDisabled 
              ? 'bg-white/10 text-white/40 cursor-not-allowed' 
              : 'bg-white text-black hover:scale-105 active:scale-95'
          }`}
        >
          SUIVANT →
        </button>
      </div>
    </div>
  );
}
