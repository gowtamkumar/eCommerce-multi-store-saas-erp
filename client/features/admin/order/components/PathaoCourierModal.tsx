'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { CourierType } from '@/lib/enums/courier-type.enum';
import type { Order } from '@/types/order';

interface PathaoCourierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (order: Order) => Promise<void>;
    order: Order;
    selectedCourier: string;
    creatingOrder: string | null;
    creatingPathaoOrder: string | null;
    pathaoCities: any[];
    pathaoZones: any[];
    pathaoAreas: any[];
    selectedCity: number;
    selectedZone: number;
    selectedArea: number;
    setSelectedArea: (areaId: number) => void;
    itemWeight: number;
    setItemWeight: (weight: number) => void;
    calculatedPrice: any;
    loadingPrice: boolean;
    handleCityChange: (cityId: number) => Promise<void>;
    handleZoneChange: (zoneId: number) => Promise<void>;
    formatPrice: (price: any) => string;
}

export default function PathaoCourierModal({
    isOpen,
    onClose,
    onConfirm,
    order,
    selectedCourier,
    creatingOrder,
    creatingPathaoOrder,
    pathaoCities,
    pathaoZones,
    pathaoAreas,
    selectedCity,
    selectedZone,
    selectedArea,
    setSelectedArea,
    itemWeight,
    setItemWeight,
    calculatedPrice,
    loadingPrice,
    handleCityChange,
    handleZoneChange,
    formatPrice,
}: PathaoCourierModalProps) {
    if (!isOpen) return null;

    const isCreating = creatingOrder === order.id || creatingPathaoOrder === order.id;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 max-w-lg w-full transform transition-all animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-xl">
                        🚚
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            Create {selectedCourier === CourierType.PATHAO ? 'Pathao' : selectedCourier === CourierType.STEADFAST ? 'Steadfast' : 'Manual'} Order
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Order ref: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">#{order.id.slice(-8).toUpperCase()}</span>
                        </p>
                    </div>
                </div>

                {selectedCourier === CourierType.PATHAO && (
                    <div className="space-y-4 mb-6 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pathao Delivery Destination Details</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">City</label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => { void handleCityChange(Number(e.target.value)); }}
                                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                >
                                    <option value={0}>Select City</option>
                                    {pathaoCities.map((city: any) => (
                                        <option key={city.city_id} value={city.city_id}>{city.city_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Zone</label>
                                <select
                                    value={selectedZone}
                                    onChange={(e) => { void handleZoneChange(Number(e.target.value)); }}
                                    disabled={!selectedCity}
                                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all disabled:opacity-50"
                                >
                                    <option value={0}>Select Zone</option>
                                    {pathaoZones.map((zone: any) => (
                                        <option key={zone.zone_id} value={zone.zone_id}>{zone.zone_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Area</label>
                                <select
                                    value={selectedArea}
                                    onChange={(e) => setSelectedArea(Number(e.target.value))} // Wait, this should probably select area
                                    disabled={!selectedZone}
                                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all disabled:opacity-50"
                                >
                                    <option value={0}>Select Area</option>
                                    {pathaoAreas.map((area: any) => (
                                        <option key={area.area_id} value={area.area_id}>{area.area_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Weight (KG)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={itemWeight}
                                    onChange={(e) => setItemWeight(Number(e.target.value))}
                                    className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                        </div>

                        {loadingPrice && (
                            <div className="text-center text-xs text-brand-600 font-medium py-2 flex items-center justify-center gap-1.5">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Estimating shipping rate...</span>
                            </div>
                        )}

                        {!loadingPrice && calculatedPrice && (
                            <div className="p-3 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900 rounded-xl flex items-center justify-between">
                                <span className="text-xs font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider">Estimated Shipping Cost:</span>
                                <span className="text-sm font-black text-brand-600">{formatPrice(calculatedPrice.price || 0)}</span>
                            </div>
                        )}
                    </div>
                )}

                {selectedCourier !== CourierType.PATHAO && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                        Are you sure you want to initialize a courier shipment for order <span className="font-bold text-slate-850 dark:text-white bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono">#{order.id.slice(-8).toUpperCase()}</span> using {selectedCourier === CourierType.STEADFAST ? 'Steadfast Courier' : 'manual dispatch'}?
                    </p>
                )}

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { void onConfirm(order); }}
                        className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-brand-500/20 flex items-center gap-2"
                        disabled={isCreating}
                    >
                        {isCreating && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        Confirm Dispatch
                    </button>
                </div>
            </div>
        </div>
    );
}
