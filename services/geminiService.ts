import { GoogleGenAI } from "@google/genai";
import type { Lead } from '../types';

// FIX: Initialize GoogleGenAI with API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// A type for the raw Maps grounding chunk from the API response
interface MapsGroundingChunk {
    maps: {
        title: string;
        uri: string;
        formattedAddress?: string;
        nationalPhoneNumber?: string;
        websiteUri?: string;
        regularOpeningHours?: {
            openNow?: boolean;
        };
    };
}

/**
 * Parses leads from a markdown-formatted text response.
 * This serves as a fallback when grounding chunks are not available.
 */
const parseLeadsFromText = (text: string): Lead[] => {
    const leads: Lead[] = [];
    // Each lead block is expected to start with a markdown bolded title (e.g., **Nome**)
    const establishmentBlocks = text.split(/\n\s*\*\*/).filter(block => block.trim().length > 10);

    for (const block of establishmentBlocks) {
        // Re-add leading asterisks for matching
        const fullBlock = `**${block}`;
        const titleMatch = fullBlock.match(/\*\*(.*?)\*\*/);
        const addressMatch = fullBlock.match(/Endereço:\s*(.*)/);
        const phoneMatch = fullBlock.match(/Telefone:\s*(.*)/);
        const websiteMatch = fullBlock.match(/Site:\s*(.*)/);
        const whatsappMatch = fullBlock.match(/WhatsApp:\s*(Sim|Não)/i);
        const openMatch = fullBlock.match(/Aberto agora:\s*(Sim|Não)/i);

        if (titleMatch && addressMatch) {
            const title = titleMatch[1].trim();
            const address = addressMatch[1].trim();
            const phone = phoneMatch ? phoneMatch[1].trim() : undefined;
            
            let website = websiteMatch ? websiteMatch[1].trim() : undefined;
            if (website && /não encontrado/i.test(website)) {
                website = undefined;
            }

            leads.push({
                title,
                address,
                phone: phone,
                website: website,
                // Create a search query for maps as a fallback URI
                mapsUri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${title}, ${address}`)}`,
                hasWhatsapp: whatsappMatch ? /sim/i.test(whatsappMatch[1]) : (phone && phone.replace(/\D/g, '').length >= 10),
                isOpen: openMatch ? /sim/i.test(openMatch[1]) : undefined,
            });
        }
    }
    return leads;
};


export const findLeads = async (
    segment: string,
    location: string,
    coords: { latitude: number; longitude: number } | null
): Promise<Lead[]> => {
    
    // FIX: Use gemini-2.5-flash model as per guidelines for basic tasks.
    const model = 'gemini-2.5-flash';
    // FIX: Increased lead count to 50 and reinforced website prompt.
    const prompt = `Liste até 50 estabelecimentos do segmento "${segment}" na localização "${location}". Para cada um, formate a resposta em markdown da seguinte forma:\n"**Nome do Estabelecimento**\nEndereço: [Endereço completo]\nTelefone: [Número de telefone]\nSite: [URL do site, Instagram ou Facebook. Se não houver, informe "Não encontrado"]\nWhatsApp: [Sim/Não]\nAberto agora: [Sim/Não]"`;

    try {
        // FIX: Configure Maps grounding tool and user location if available.
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                ...(coords && {
                    toolConfig: {
                        retrievalConfig: {
                            latLng: {
                                latitude: coords.latitude,
                                longitude: coords.longitude,
                            }
                        }
                    }
                })
            }
        });

        const allLeads: Lead[] = [];
        
        // 1. Prioritize structured grounding chunks for accuracy
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as MapsGroundingChunk[] | undefined;
        if (groundingChunks && groundingChunks.length > 0) {
            const groundLeads = groundingChunks.map(chunk => {
                 const place = chunk.maps;
                 const hasWhatsapp = !!(place.nationalPhoneNumber && place.nationalPhoneNumber.replace(/\D/g, '').length >= 10);
                 return {
                     title: place.title,
                     address: place.formattedAddress || 'Endereço não disponível',
                     phone: place.nationalPhoneNumber,
                     website: place.websiteUri,
                     mapsUri: place.uri,
                     isOpen: place.regularOpeningHours?.openNow,
                     hasWhatsapp: hasWhatsapp,
                 };
            }).filter(lead => lead.title && lead.address !== 'Endereço não disponível');
            allLeads.push(...groundLeads);
        }

        // 2. Fallback or supplement with text parsing
        const textResponse = response.text;
        if (textResponse) {
            const textLeads = parseLeadsFromText(textResponse);
            allLeads.push(...textLeads);
        }

        // 3. Remove duplicates, prioritizing grounded results if titles match
        const uniqueLeads = Array.from(
            new Map(allLeads.map(lead => [
                // Use a key of normalized title and address to find duplicates
                `${lead.title.toLowerCase().trim()}-${lead.address.toLowerCase().trim().substring(0, 15)}`, 
                lead
            ])).values()
        );

        return uniqueLeads;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Falha ao buscar leads. Verifique sua conexão e chave de API.");
    }
};