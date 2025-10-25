import React, { useState } from 'react';
import { BuildingIcon } from './icons/BuildingIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { TargetIcon } from './icons/TargetIcon';
import { LoadingSpinner } from './LoadingSpinner';

interface SearchFormProps {
    onSearch: (segment: string, location: string) => void;
    onLocate: () => void;
    isLoading: boolean;
    isLocating: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, onLocate, isLoading, isLocating }) => {
    const [segment, setSegment] = useState('Restaurante italiano');
    const [location, setLocation] = useState('São Paulo, SP');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (segment && location && !isLoading) {
            onSearch(segment, location);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-card p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
            <div className="relative">
                <label htmlFor="segment" className="block text-sm font-medium text-text-secondary mb-2">Segmento</label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <BuildingIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        id="segment"
                        type="text"
                        value={segment}
                        onChange={(e) => setSegment(e.target.value)}
                        placeholder="Digite aqui o segmento"
                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition text-black"
                        required
                    />
                </div>
            </div>

            <div className="relative">
                <label htmlFor="location" className="block text-sm font-medium text-text-secondary mb-2">Localização</label>
                <div className="relative">
                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <MapPinIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Digite aqui a Localização"
                        className="w-full pl-12 pr-16 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition text-black"
                        required
                    />
                    <button
                        type="button"
                        onClick={onLocate}
                        disabled={isLocating}
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-14 text-accent hover:opacity-80 transition-colors disabled:opacity-50"
                        title="Usar minha localização atual"
                    >
                        {isLocating ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-dark"></div>
                        ) : (
                            <TargetIcon className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-bold py-4 px-4 rounded-lg hover:bg-primary-dark transition-transform transform hover:scale-105 duration-300 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <LoadingSpinner />
                        <span className="ml-3">Buscando...</span>
                    </>
                ) : (
                    'Encontrar Leads'
                )}
            </button>
        </form>
    );
};