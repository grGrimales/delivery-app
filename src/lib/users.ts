const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getAvailableDrivers(token: string) {
    const response = await fetch(`${API_URL}/users/drivers/available`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) throw new Error('Error al obtener repartidores');
    return response.json();
}