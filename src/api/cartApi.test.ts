import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cartApi } from './cartApi';
import { supabase } from '../lib/supabaseClient';
import { apiClient } from './apiClient';

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('./apiClient', () => ({
  apiClient: {
    request: vi.fn(),
  },
}));

const createBuilder = () => {
  const builder: any = {};
  builder.select = vi.fn(() => builder);
  builder.upsert = vi.fn(() => builder);
  builder.update = vi.fn(() => builder);
  builder.delete = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  return builder;
};

describe('cartApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCart', () => {
    it('should fetch and transform cart items', async () => {
      const builder = createBuilder();
      (supabase.from as any).mockReturnValue(builder);

      const mockRows = [
        {
          supplement_id: '1',
          quantity: 2,
          supplements: {
            name: 'Test',
            price_aed: 10,
            form_image_url: 'img.png',
            description: 'desc',
          },
        },
      ];

      (apiClient.request as any).mockImplementation(async (op: any) => {
        op();
        return mockRows;
      });

      const result = await cartApi.getCart('user1');

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(builder.select).toHaveBeenCalledWith(
        'id, supplement_id, quantity, supplements(*)'
      );
      expect(builder.eq).toHaveBeenCalledWith('user_id', 'user1');

      expect(result).toEqual([
        {
          id: '1',
          name: 'Test',
          price: 10,
          quantity: 2,
          image: 'img.png',
          description: 'desc',
        },
      ]);
    });
  });

  describe('addItem', () => {
    it('should insert item into cart', async () => {
      const builder = createBuilder();
      (supabase.from as any).mockReturnValue(builder);

      (apiClient.request as any).mockImplementation(async (op: any) => {
        op();
      });

      await cartApi.addItem('user1', 'supp1', 3);

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(builder.upsert).toHaveBeenCalledWith(
        { user_id: 'user1', supplement_id: 'supp1', quantity: 3 },
        { onConflict: 'user_id,supplement_id' }
      );
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity for an item', async () => {
      const builder = createBuilder();
      (supabase.from as any).mockReturnValue(builder);

      (apiClient.request as any).mockImplementation(async (op: any) => {
        op();
      });

      await cartApi.updateQuantity('user1', 'supp1', 5);

      expect(builder.update).toHaveBeenCalledWith({ quantity: 5 });
      expect(builder.eq).toHaveBeenNthCalledWith(1, 'user_id', 'user1');
      expect(builder.eq).toHaveBeenNthCalledWith(2, 'supplement_id', 'supp1');
    });
  });

  describe('removeItem', () => {
    it('should delete item from cart', async () => {
      const builder = createBuilder();
      (supabase.from as any).mockReturnValue(builder);

      (apiClient.request as any).mockImplementation(async (op: any) => {
        op();
      });

      await cartApi.removeItem('user1', 'supp1');

      expect(builder.delete).toHaveBeenCalled();
      expect(builder.eq).toHaveBeenNthCalledWith(1, 'user_id', 'user1');
      expect(builder.eq).toHaveBeenNthCalledWith(2, 'supplement_id', 'supp1');
    });
  });

  describe('clearCart', () => {
    it('should clear all items for user', async () => {
      const builder = createBuilder();
      (supabase.from as any).mockReturnValue(builder);

      (apiClient.request as any).mockImplementation(async (op: any) => {
        op();
      });

      await cartApi.clearCart('user1');

      expect(builder.delete).toHaveBeenCalled();
      expect(builder.eq).toHaveBeenCalledWith('user_id', 'user1');
    });
  });
});
