'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { CourierType } from '@/lib/enums/courier-type.enum';
import { handleCreatePathaoOrder, handleCreateSteadfastOrder, handleManualDispatch, updateOrderStatus } from '@/lib/utils';
import type { Order } from '@/types/order';

export function useOrderDetails(id: string) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [selectedCourier, setSelectedCourier] = useState<string>('');
    const [showCourierModal, setShowCourierModal] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState<string | null>(null);
    const [creatingPathaoOrder, setCreatingPathaoOrder] = useState<string | null>(null);

    // Pathao city/zone integration and live status tracking
    const [pathaoCities, setPathaoCities] = useState<any[]>([]);
    const [pathaoZones, setPathaoZones] = useState<any[]>([]);
    const [pathaoAreas, setPathaoAreas] = useState<any[]>([]);
    const [selectedCity, setSelectedCity] = useState<number>(0);
    const [selectedZone, setSelectedZone] = useState<number>(0);
    const [selectedArea, setSelectedArea] = useState<number>(0);
    const [itemWeight, setItemWeight] = useState<number>(0.5);
    const [calculatedPrice, setCalculatedPrice] = useState<any>(null);
    const [loadingPrice, setLoadingPrice] = useState(false);
    const [liveStatus, setLiveStatus] = useState<any>(null);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    const fetchOrder = useCallback(async () => {
        if (!id) return;
        try {
            const res = await fetchAPI(`/orders/${id}`);
            if (res.success && res.data) {
                setOrder(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch order', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void fetchOrder();
    }, [fetchOrder]);

    const handleStatusUpdate = useCallback(async (updates: any) => {
        if (!id) return;
        setUpdating(true);
        const result = await updateOrderStatus(id, updates);

        if (result.success && result.data) {
            setOrder(result.data);
            toast.success('Order updated successfully');
        } else {
            toast.error(result.error || 'Failed to update order');
        }
        setUpdating(false);
    }, [id]);

    const handleRefresh = useCallback(async () => {
        await fetchOrder();
        toast.success('Order data refreshed');
    }, [fetchOrder]);

    const handleCourierSelect = useCallback((courier: string) => {
        if (courier) {
            setSelectedCourier(courier);
            setShowCourierModal(true);
        }
    }, []);

    const fetchCities = useCallback(async () => {
        try {
            const res = await fetchAPI('/courier/pathao/cities');
            if (res.success && res.data?.data?.data) {
                setPathaoCities(res.data.data.data);
            }
        } catch (error) {
            console.error('Failed to load cities', error);
        }
    }, []);

    const calculatePrice = useCallback(async (cityId: number, zoneId: number) => {
        setLoadingPrice(true);
        try {
            const res = await fetchAPI('/courier/pathao/price-calculation', {
                method: 'POST',
                body: JSON.stringify({
                    recipientCity: cityId,
                    recipientZone: zoneId,
                    itemWeight,
                    itemType: 2,
                    deliveryType: 48,
                })
            });
            if (res.success && res.data?.data) {
                setCalculatedPrice(res.data.data);
            }
        } catch (error) {
            console.error('Failed to calculate price', error);
        } finally {
            setLoadingPrice(false);
        }
    }, [itemWeight]);

    const handleCityChange = useCallback(async (cityId: number) => {
        setSelectedCity(cityId);
        setSelectedZone(0);
        setSelectedArea(0);
        setCalculatedPrice(null);
        try {
            const res = await fetchAPI(`/courier/pathao/city/${cityId}/zones`);
            if (res.success && res.data?.data?.data) {
                setPathaoZones(res.data.data.data);
            }
        } catch (error) {
            console.error('Failed to load zones', error);
        }
    }, []);

    const handleZoneChange = useCallback(async (zoneId: number) => {
        setSelectedZone(zoneId);
        setSelectedArea(0);
        setCalculatedPrice(null);
        try {
            const res = await fetchAPI(`/courier/pathao/zone/${zoneId}/areas`);
            if (res.success && res.data?.data?.data) {
                setPathaoAreas(res.data.data.data);
            }
            void calculatePrice(selectedCity, zoneId);
        } catch (error) {
            console.error('Failed to load areas', error);
        }
    }, [selectedCity, calculatePrice]);

    useEffect(() => {
        if (showCourierModal && selectedCourier === CourierType.PATHAO) {
            void fetchCities();
        }
    }, [showCourierModal, selectedCourier, fetchCities]);

    const handleConfirmCourierOrder = useCallback(async (currentOrder: Order) => {
        const courier = selectedCourier;
        setShowCourierModal(false);
        setSelectedCourier('');

        let res;
        if (courier === CourierType.STEADFAST) {
            res = await handleCreateSteadfastOrder(currentOrder, setCreatingOrder);
        } else if (courier === CourierType.PATHAO) {
            res = await handleCreatePathaoOrder(currentOrder, setCreatingPathaoOrder, {
                recipient_city: selectedCity || undefined,
                recipient_zone: selectedZone || undefined,
                recipient_area: selectedArea || undefined,
                item_weight: itemWeight,
            });
        } else if (courier === CourierType.IN_STORE) {
            res = await handleManualDispatch(currentOrder, setCreatingOrder);
        }

        if (res?.success) {
            void fetchOrder();
        }
    }, [selectedCourier, selectedCity, selectedZone, selectedArea, itemWeight, fetchOrder]);

    const handleCancelCourierOrder = useCallback(() => {
        setShowCourierModal(false);
        setSelectedCourier('');
        setPathaoZones([]);
        setPathaoAreas([]);
        setSelectedCity(0);
        setSelectedZone(0);
        setSelectedArea(0);
        setCalculatedPrice(null);
    }, []);

    const handleCheckLiveStatus = useCallback(async () => {
        if (!order || !order.trackingId || !order.courierStatus) return;
        setLoadingStatus(true);
        setShowStatusModal(true);
        try {
            const courier = order.courierStatus.toLowerCase();
            const res = await fetchAPI(`/courier/${courier}/status/${order.trackingId}`);
            if (res.success && res.data) {
                setLiveStatus(res.data);
            } else {
                toast.error('Could not fetch tracking data from courier');
            }
        } catch (error) {
            console.error('Failed to check status', error);
            toast.error('Failed to fetch live courier status');
        } finally {
            setLoadingStatus(false);
        }
    }, [order]);

    const handlePrintLabel = useCallback(async () => {
        if (!order || !order.trackingId || !order.courierStatus) return;
        try {
            const courier = order.courierStatus.toLowerCase();
            if (courier === 'steadfast') {
                const res = await fetchAPI(`/courier/steadfast/label/${order.trackingId}`);
                if (res.success && res.data?.printUrl) {
                    window.open(res.data.printUrl, '_blank');
                } else {
                    toast.error('Failed to fetch label link');
                }
            } else {
                toast.error('Label download is only supported for Steadfast at this time');
            }
        } catch (error) {
            console.error('Failed to get label', error);
            toast.error('Failed to retrieve shipping label');
        }
    }, [order]);

    const getItemReturnStatus = useCallback((productId: string, variantId?: string) => {
        if (!order?.returns) return null;
        for (const req of order.returns) {
            const found = req.items.find((i: any) =>
                i.productId === productId &&
                (i.variantId === variantId || (!i.variantId && !variantId))
            );
            if (found) return req.status;
        }
        return null;
    }, [order]);

    // Memoize pricing calculations to boost rendering safety
    const subtotal = useMemo(() => {
        if (!order?.items) return 0;
        return order.items.reduce((acc, item) => acc + (Number(item.unitPrice) * item.quantity), 0);
    }, [order?.items]);

    const totalDiscount = useMemo(() => {
        if (!order?.items) return 0;
        return order.items.reduce((acc, item) => acc + (Number(item.discountAmount) * item.quantity), 0);
    }, [order?.items]);

    const totalRefunded = useMemo(() => {
        if (!order?.returns || !order?.items) return 0;
        return order.returns.reduce((total, returnReq) => {
            if (returnReq.status === 'approved' || returnReq.status === 'refunded') {
                return total + returnReq.items.reduce((itemTotal: number, returnItem: any) => {
                    const orderItem = order.items?.find((oi: any) =>
                        oi.productId === returnItem.productId &&
                        (oi.variantId === returnItem.variantId || (!oi.variantId && !returnItem.variantId))
                    );
                    if (orderItem) {
                        const itemPrice = Number(orderItem.unitPrice) - Number(orderItem.discountAmount || 0);
                        return itemTotal + (itemPrice * returnItem.quantity);
                    }
                    return itemTotal;
                }, 0);
            }
            return total;
        }, 0);
    }, [order?.returns, order?.items]);

    return {
        order,
        setOrder,
        loading,
        updating,
        selectedCourier,
        showCourierModal,
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
        liveStatus,
        setLiveStatus,
        loadingStatus,
        showStatusModal,
        setShowStatusModal,
        handleStatusUpdate,
        handleRefresh,
        handleCourierSelect,
        handleCityChange,
        handleZoneChange,
        handleConfirmCourierOrder,
        handleCancelCourierOrder,
        handleCheckLiveStatus,
        handlePrintLabel,
        getItemReturnStatus,
        subtotal,
        totalDiscount,
        totalRefunded,
    };
}
