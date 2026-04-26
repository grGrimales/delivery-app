const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getOrders(token: string) {
    const response = await fetch(`${API_URL}/orders`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error('Fallo al obtener las órdenes del servidor');
    }

    return response.json();
}

export async function assignDriver(orderId: string, driverId: string, token: string) {
    const response = await fetch(`${API_URL}/orders/${orderId}/assign`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ driverId })
    });
    return response.json();
}


export async function createOrder(orderData: any, token: string) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la orden');
    }

    return response.json();
}