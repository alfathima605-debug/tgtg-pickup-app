import type { PickupOrder } from './types';
import { generateCode } from './types';

const STORAGE_KEY = 'pickup-orders';

const SEED: PickupOrder[] = [
  {
    id: 'order-001',
    restaurantName: 'Happy Lamb Hot Pot',
    restaurantAddress: '21 Ladywell Walk, Birmingham B5 4ST, UK',
    restaurantLogo: '',
    orderName: 'Happy Lamb Hot Favorites Bag',
    quantity: 1,
    unitPrice: 4.99,
    pickupDate: new Date().toISOString().slice(0, 10),
    pickupStart: '22:00',
    pickupEnd: '22:30',
    packagingNote: 'The store will provide packaging for your food, but we encourage you to bring your own bag to carry it home in.',
    collectionNote: '',
    confirmationCode: 'V7SW15S9NSZNO',
    status: 'ready_for_pickup',
    createdAt: new Date().toISOString(),
    category: 'Meals',
    rating: 4.6,
    reviewCount: 234,
    pickupAddress: '21 Ladywell Walk, Birmingham B5 4ST',
    surpriseBagContents: 'A selection of hot pot favorites including beef slices, noodles, vegetables, and dipping sauces.',
  },
  {
    id: 'order-002',
    restaurantName: 'Birmingham Curry House',
    restaurantAddress: '45 Digbeth High St, Birmingham B5 6DY, UK',
    restaurantLogo: '',
    orderName: 'Curry Surprise Bag',
    quantity: 2,
    unitPrice: 5.49,
    pickupDate: new Date().toISOString().slice(0, 10),
    pickupStart: '21:00',
    pickupEnd: '21:30',
    packagingNote: 'Please bring your own containers if possible.',
    collectionNote: 'Mention the code at the counter.',
    confirmationCode: 'BC8RT4NMX2PLY',
    status: 'ready_for_pickup',
    createdAt: new Date().toISOString(),
    category: 'Meals',
    rating: 4.4,
    reviewCount: 567,
    pickupAddress: '45 Digbeth High St, Birmingham B5 6DY',
    surpriseBagContents: 'Curry of the day with rice, naan bread, and a side dish.',
  },
];

function load(): PickupOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  save(SEED);
  return SEED;
}

function save(orders: PickupOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function getOrders(): PickupOrder[] {
  return load();
}

export function getOrder(id: string): PickupOrder | undefined {
  return load().find((o) => o.id === id);
}

export function createOrder(data: Omit<PickupOrder, 'id' | 'createdAt' | 'confirmationCode'> & { confirmationCode?: string }): PickupOrder {
  const orders = load();
  const order: PickupOrder = {
    ...data,
    id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    confirmationCode: data.confirmationCode || generateCode(),
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);
  save(orders);
  return order;
}

export function updateOrder(id: string, data: Partial<PickupOrder>): PickupOrder | undefined {
  const orders = load();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  orders[idx] = { ...orders[idx], ...data };
  save(orders);
  return orders[idx];
}

export function deleteOrder(id: string): boolean {
  const orders = load();
  const next = orders.filter((o) => o.id !== id);
  if (next.length === orders.length) return false;
  save(next);
  return true;
}
