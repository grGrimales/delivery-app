export const translations = {
  pt: {
    admin: {
      title: "Painel de Controle",
      active: "Ativos",
      today: "Hoje",
      current_orders: "Pedidos em curso",
      loading_map: "Carregando mapa...",
      desc: "Gestão completa de pedidos e estafetas em tempo real."
    },
    driver: {
      title: "App Entregador",
      current_order: "Pedido Atual",
      pickup: "Coletar Pedido",
      delivered: "Marcar como Entregue",
      no_orders: "Você não tem pedidos ativos.",
      desc: "Interface dedicada para o estafeta com GPS e chat."
    },
    track: {
      title: "Rastreio Público",
      desc: "Vista exclusiva para o cliente acompanhar a entrega."
    },
    status: {
      PREPARING: "Preparando",
      ON_WAY: "A caminho",
      DELIVERED: "Entregue",
    },
    chat: {
      placeholder: "Escreva uma mensagem...",
      send: "Enviar",
    },
    home: {
      welcome: "Bem-vindo ao Delivery App",
      subtitle: "Escolha o módulo que deseja acessar para começar a gerenciar seus pedidos em tempo real."
    }
  },
  es: {
    admin: {
      title: "Panel de Control",
      active: "Activos",
      today: "Hoy",
      current_orders: "Pedidos en curso",
      loading_map: "Cargando mapa...",
      desc: "Gestión completa de pedidos y repartidores en tiempo real."
    },
    driver: {
      title: "App Repartidor",
      current_order: "Pedido Actual",
      pickup: "Recoger Pedido",
      delivered: "Marcar como Entregado",
      no_orders: "No tienes pedidos activos.",
      desc: "Interfaz dedicada para el repartidor con GPS y chat."
    },
    track: {
      title: "Rastreo Público",
      desc: "Vista exclusiva para el cliente seguir la entrega."
    },
    status: {
      PREPARING: "Preparando",
      ON_WAY: "En camino",
      DELIVERED: "Entregado",
    },
    chat: {
      placeholder: "Escribe un mensaje...",
      send: "Enviar",
    },
    home: {
      welcome: "Bienvenido al Delivery App",
      subtitle: "Elige el módulo al que deseas acceder para comenzar a gestionar tus pedidos en tiempo real."
    }
  },
  en: {
    admin: {
      title: "Admin Dashboard",
      active: "Active",
      today: "Today",
      current_orders: "Ongoing Orders",
      loading_map: "Loading map...",
      desc: "Complete real-time order and driver management."
    },
    driver: {
      title: "Driver App",
      current_order: "Current Order",
      pickup: "Pick up Order",
      delivered: "Mark as Delivered",
      no_orders: "No active orders found.",
      desc: "Dedicated driver interface with GPS and chat."
    },
    track: {
      title: "Public Tracking",
      desc: "Exclusive view for customers to track their delivery."
    },
    status: {
      PREPARING: "Preparing",
      ON_WAY: "On the way",
      DELIVERED: "Delivered",
    },
    chat: {
      placeholder: "Type a message...",
      send: "Send",
    },
    home: {
      welcome: "Welcome to Delivery App",
      subtitle: "Choose the module you want to access to start managing your orders in real time."
    }
  }
};

export type Language = 'pt' | 'es' | 'en';
