const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al asignar conductor');
    }
    
    return response.json();
}


export async function createOrder(orderData: any, token: string) {
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

export async function getMyOrders(token: string) {
    const response = await fetch(`${API_URL}/orders/driver/my-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al obtener mis órdenes');
    return response.json();
}

export async function updateOrderStatus(orderId: string, status: string, token: string) {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar estado');
    }
    
    return response.json();
}

export async function getDrivers(token: string) {
    const response = await fetch(`${API_URL}/users/drivers`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al obtener conductores');
    return response.json();
}
