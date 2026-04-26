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