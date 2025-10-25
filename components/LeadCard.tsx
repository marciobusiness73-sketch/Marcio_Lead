import React from 'react';
import type { Lead } from '../types';
import { PhoneIcon } from './icons/PhoneIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { NavigationIcon } from './icons/NavigationIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { detectSocialMedia } from '../utils/urlUtils';

interface LeadCardProps {
  lead: Lead;
}

const InfoRow: React.FC<{ icon: React.ReactNode; text?: string; href?: string; children?: React.ReactNode }> = ({ icon, text, href, children }) => {
    if (!text && !children) return null;

    const content = children || <span className="break-words">{text}</span>;

    const WrapperComponent = href ? 'a' : 'div';
    
    return (
        <WrapperComponent 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`flex items-start space-x-3 text-sm text-text-secondary ${href ? 'hover:text-primary transition-colors' : ''}`}
        >
            <span className="mt-0.5 text-slate-400 flex-shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">{content}</div>
        </WrapperComponent>
    );
};

export const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  const websiteType = detectSocialMedia(lead.website);

  const getWebsiteIcon = () => {
    switch (websiteType) {
      case 'instagram':
        return <InstagramIcon className="h-4 w-4" />;
      case 'facebook':
        return <FacebookIcon className="h-4 w-4" />;
      default:
        return <GlobeIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col space-y-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <header>
        <h3 className="text-xl font-bold text-text-primary" title={lead.title}>
          {lead.title}
        </h3>
      </header>
      
      <div className="flex-grow space-y-4">
        <InfoRow icon={<MapPinIcon className="h-4 w-4" />} text={lead.address} />
        <InfoRow icon={<PhoneIcon className="h-4 w-4" />} text={lead.phone} href={lead.phone ? `tel:${lead.phone}` : undefined} />
        <InfoRow icon={getWebsiteIcon()} text={lead.website} href={lead.website} />
      </div>

      <footer className="border-t border-slate-200 pt-4 flex flex-col space-y-3">
        <div className="flex items-center justify-between text-sm min-h-[20px]">
            {lead.isOpen !== undefined ? (
                <div className={`flex items-center space-x-2 ${lead.isOpen ? 'text-green-600' : 'text-amber-600'}`}>
                    {lead.isOpen ? <CheckCircleIcon className="h-4 w-4" /> : <AlertTriangleIcon className="h-4 w-4" />}
                    <span>{lead.isOpen ? 'Aberto agora' : 'Fechado agora'}</span>
                </div>
            ) : <div/>}
            {lead.hasWhatsapp && (
                <div className="flex items-center space-x-2 text-green-600 font-medium">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.354 1.654zm11.892-21.891c-5.448 0-9.888 4.44-9.888 9.888 0 1.838.495 3.578 1.354 5.079l-1.353 4.939 5.018-1.318c1.444.82 3.128 1.271 4.869 1.271 5.448 0 9.888-4.44 9.888-9.888 0-5.448-4.44-9.888-9.888-9.888z"/></svg>
                    <span>WhatsApp</span>
                </div>
             )}
        </div>
        <a 
            href={lead.mapsUri} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-primary/10 text-primary font-bold py-2.5 px-4 rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center space-x-2"
        >
            <NavigationIcon className="h-4 w-4" />
            <span>Ver no Mapa</span>
        </a>
      </footer>
    </div>
  );
};
