// FIX: Define the Lead interface to type the data returned from the geminiService.
export interface Lead {
  title: string;
  address: string;
  phone?: string;
  website?: string;
  mapsUri: string;
  hasWhatsapp?: boolean;
  isOpen?: boolean;
}
