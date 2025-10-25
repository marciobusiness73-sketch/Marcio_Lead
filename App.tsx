import React, { useState, useCallback } from 'react';
// FIX: Correctly import from existing files which were previously empty.
import { findLeads } from './services/geminiService';
import type { Lead } from './types';
import { LeadCard } from './components/LeadCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SearchForm } from './components/SearchForm';

const App: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState<boolean>(false);
    const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [hasSearched, setHasSearched] = useState<boolean>(false);

    const handleSearch = useCallback(async (segment: string, location: string) => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);
        setLeads([]);

        try {
            const results = await findLeads(segment, location, userCoords);
            setLeads(results);
            if (results.length === 0) {
                 setError("Nenhum lead encontrado para os critérios informados.");
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Ocorreu um erro desconhecido.");
        } finally {
            setIsLoading(false);
        }
    }, [userCoords]);

    const handleLocate = () => {
        if (!navigator.geolocation) {
            setError("Geolocalização não é suportada por este navegador.");
            return;
        }

        setIsLocating(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setIsLocating(false);
                // Trigger a search with the new coordinates
                 handleSearch('Restaurantes', 'Minha localização atual');
            },
            (err) => {
                setError(`Erro ao obter localização: ${err.message}`);
                setIsLocating(false);
            }
        );
    };

    const handleClear = () => {
        setLeads([]);
        setError(null);
        setHasSearched(false);
    };

    const renderResults = () => {
        if (isLoading) {
            return (
                <div className="text-center p-10">
                    <LoadingSpinner />
                    <p className="mt-4 text-slate-300 font-semibold">Procurando os melhores leads para você...</p>
                </div>
            );
        }

        if (error) {
            return (
                 <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 font-semibold">{error}</p>
                 </div>
            );
        }

        if (leads.length > 0) {
            return (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {leads.map((lead, index) => (
                        <LeadCard key={`${lead.title}-${index}`} lead={lead} />
                    ))}
                 </div>
            );
        }
        
        if (hasSearched) {
             return null; // Error message will be shown if leads are empty after a search
        }

        return (
            <div className="text-center p-10 bg-slate-50 border border-slate-200 rounded-lg">
                <h2 className="text-xl font-semibold text-text-primary">Pronto para encontrar novos clientes?</h2>
                <p className="mt-2 text-text-secondary">Preencha os campos acima para iniciar sua busca por leads.</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background text-slate-100 font-sans">
            <main className="container mx-auto px-4 py-8 md:py-12">
                <header className="text-center mb-10">
                     <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-titleGradientStart to-secondary">
                        Infinite Lead
                     </h1>
                    <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
                        Informe o segmento e a localização para encontrar clientes em potencial com dados atualizados do Google Maps.
                    </p>
                </header>

                <div className="max-w-2xl mx-auto mb-12">
                   <SearchForm 
                    onSearch={handleSearch}
                    onLocate={handleLocate}
                    isLoading={isLoading}
                    isLocating={isLocating}
                   />
                </div>

                <div className="mt-12">
                    {hasSearched && !isLoading && leads.length > 0 && (
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={handleClear}
                                className="bg-accent text-white font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                                title="Limpar resultados"
                            >
                                Limpar
                            </button>
                        </div>
                    )}
                   {renderResults()}
                </div>
            </main>
             <footer className="text-center py-6 text-sm text-slate-300">
                <p>Desenvolvido por: Márcio Alexandre</p>
            </footer>
        </div>
    );
};

export default App;