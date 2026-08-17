export type OrderStatus = 'ready_for_pickup' | 'picked_up' | 'cancelled';

export interface PickupOrder {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantLogo: string;
  orderName: string;
  quantity: number;
  unitPrice: number;
  pickupDate: string;
  pickupStart: string;
  pickupEnd: string;
  packagingNote: string;
  collectionNote: string;
  confirmationCode: string;
  status: OrderStatus;
  createdAt: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  pickupAddress?: string;
  surpriseBagContents?: string;
}

export function getTotal(order: PickupOrder): number {
  return order.quantity * order.unitPrice;
}

export function formatGBP(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

export function generateCode(): string {
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
  const vowels = 'AEIOU23456789';
  const all = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  let code = '';
  for (let i = 0; i < 13; i++) {
    if (i === 0 || i === 6 || i === 12) {
      code += consonants.charAt(Math.floor(Math.random() * consonants.length));
    } else if (i === 1 || i === 5 || i === 11) {
      code += vowels.charAt(Math.floor(Math.random() * vowels.length));
    } else {
      code += all.charAt(Math.floor(Math.random() * all.length));
    }
  }
  return code;
}

export function statusColor(s: OrderStatus) {
  if (s === 'ready_for_pickup') return 'bg-teal text-white';
  if (s === 'picked_up') return 'bg-green-100 text-green-700';
  return 'bg-red-100 text-red-600';
}

export function statusLabel(s: OrderStatus) {
  if (s === 'ready_for_pickup') return 'Ready';
  if (s === 'picked_up') return 'Picked up';
  return 'Cancelled';
}
