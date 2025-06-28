import { apiClient } from './apiClient';
import { supabase } from '../lib/supabaseClient';
import type { CartItem } from '../store/useCartStore';

export const cartApi = {
  async getCart(userId: string): Promise<CartItem[]> {
    return apiClient.request(
      () =>
        supabase
          .from('cart_items')
          .select('id, supplement_id, quantity, supplements(*)')
          .eq('user_id', userId),
      'Failed to fetch cart items'
    ).then(rows =>
      rows.map(r => ({
        id: r.supplement_id,
        name: r.supplements.name,
        price: r.supplements.price_aed || r.supplements.price || 0,
        quantity: r.quantity,
        image: r.supplements.form_image_url || r.supplements.image_url || '',
        description: r.supplements.description || ''
      }))
    );
  },

  async addItem(userId: string, supplementId: string, quantity = 1): Promise<void> {
    await apiClient.request(
      () =>
        supabase
          .from('cart_items')
          .upsert({ user_id: userId, supplement_id: supplementId, quantity }, { onConflict: 'user_id,supplement_id' }),
      'Failed to add item to cart'
    );
  },

  async updateQuantity(userId: string, supplementId: string, quantity: number): Promise<void> {
    await apiClient.request(
      () =>
        supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', userId)
          .eq('supplement_id', supplementId),
      'Failed to update cart item'
    );
  },

  async removeItem(userId: string, supplementId: string): Promise<void> {
    await apiClient.request(
      () =>
        supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
          .eq('supplement_id', supplementId),
      'Failed to remove cart item'
    );
  },

  async clearCart(userId: string): Promise<void> {
    await apiClient.request(
      () => supabase.from('cart_items').delete().eq('user_id', userId),
      'Failed to clear cart'
    );
  }
};
