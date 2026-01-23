// src/lib/iapManager.js
// Production-ready IAP using RevenueCat (recommended for cross-platform)
// Alternative: Native StoreKit (iOS) / Google Play Billing (Android)

import { supabase } from './supabase';

// RevenueCat Configuration
const REVENUECAT_API_KEY = process.env.VITE_REVENUECAT_API_KEY;
const REVENUECAT_APP_USER_ID_PREFIX = 'cluepic_';

// Product IDs (must match App Store Connect / Google Play Console)
export const PRODUCT_IDS = {
  // Premium Subscriptions
  PREMIUM_MONTHLY: 'premium_monthly',
  PREMIUM_YEARLY: 'premium_yearly', 
  PREMIUM_LIFETIME: 'premium_lifetime',
  
  // Archive
  ARCHIVE_UNLOCK: 'archive_unlock',
  
  // Expansion Packs
  EXPANSION_ANIMALS: 'expansion_animals',
  EXPANSION_NATURE: 'expansion_nature',
  EXPANSION_FOOD: 'expansion_food',
  EXPANSION_HALLOWEEN: 'expansion_halloween',
  EXPANSION_SPORTS: 'expansion_sports',
  EXPANSION_MUSIC: 'expansion_music',
  EXPANSION_TRAVEL: 'expansion_travel',
  EXPANSION_PROFESSIONS: 'expansion_professions',
  
  // Consumables
  HINTS_5: 'hints_5',
  HINTS_15: 'hints_15',
  HINTS_50: 'hints_50',
  CLUES_5: 'clues_5',
  CLUES_15: 'clues_15',
  CLUES_50: 'clues_50'
};

// Product pricing (for display - actual prices from stores)
export const PRODUCT_PRICES = {
  [PRODUCT_IDS.PREMIUM_MONTHLY]: { price: '£2.99', period: '/month' },
  [PRODUCT_IDS.PREMIUM_YEARLY]: { price: '£19.99', period: '/year', save: '44%' },
  [PRODUCT_IDS.PREMIUM_LIFETIME]: { price: '£49.99', period: 'one-time', save: 'Best Value' },
  [PRODUCT_IDS.ARCHIVE_UNLOCK]: { price: '£9.99', period: 'one-time' },
  [PRODUCT_IDS.HINTS_5]: { price: '£0.49', quantity: 5 },
  [PRODUCT_IDS.HINTS_15]: { price: '£0.99', quantity: 15, save: '34%' },
  [PRODUCT_IDS.HINTS_50]: { price: '£2.99', quantity: 50, save: 'Best Value' },
  [PRODUCT_IDS.CLUES_5]: { price: '£0.49', quantity: 5 },
  [PRODUCT_IDS.CLUES_15]: { price: '£0.99', quantity: 15, save: '34%' },
  [PRODUCT_IDS.CLUES_50]: { price: '£2.99', quantity: 50, save: 'Best Value' }
};

class IAPManager {
  constructor() {
    this.initialized = false;
    this.purchaseListeners = [];
  }

  // Initialize RevenueCat SDK
  async initialize(userId) {
    if (this.initialized) return true;

    try {
      // For web: Use RevenueCat REST API
      // For native apps: Use RevenueCat SDK
      const rcUserId = `${REVENUECAT_APP_USER_ID_PREFIX}${userId}`;
      
      // Initialize RevenueCat
      if (window.Purchases) {
        await window.Purchases.configure(REVENUECAT_API_KEY, rcUserId);
      }
      
      this.initialized = true;
      console.log('✅ IAP Manager initialized');
      return true;
    } catch (error) {
      console.error('❌ IAP initialization failed:', error);
      return false;
    }
  }

  // Get available products
  async getProducts(productIds = []) {
    try {
      if (window.Purchases) {
        const offerings = await window.Purchases.getOfferings();
        return offerings.current?.availablePackages || [];
      }
      
      // Fallback: Return mock products for web preview
      return productIds.map(id => ({
        identifier: id,
        price: PRODUCT_PRICES[id]?.price || '£0.00',
        priceString: PRODUCT_PRICES[id]?.price || '£0.00'
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  // Purchase product
  async purchaseProduct(productId, userId) {
    try {
      console.log(`🛒 Initiating purchase: ${productId}`);
      
      // Native IAP via RevenueCat
      if (window.Purchases) {
        const purchase = await window.Purchases.purchasePackage(productId);
        
        if (purchase.customerInfo.entitlements.active['premium']) {
          await this.activatePurchase(userId, productId, purchase);
          return { success: true, purchase };
        }
      }
      
      // Web fallback - simulate purchase for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ DEV MODE: Simulating purchase');
        await this.activatePurchase(userId, productId, { mock: true });
        return { success: true, mock: true };
      }
      
      throw new Error('Purchase platform not available');
    } catch (error) {
      console.error('Purchase failed:', error);
      
      if (error.code === 'USER_CANCELLED') {
        return { success: false, cancelled: true };
      }
      
      return { success: false, error: error.message };
    }
  }

  // Activate purchase in backend
  async activatePurchase(userId, productId, purchaseData) {
    try {
      // Determine purchase type
      const updates = {};
      
      // Premium subscriptions
      if (productId.includes('premium')) {
        updates.is_premium = true;
        updates.premium_expires_at = this.calculateExpiryDate(productId);
      }
      
      // Archive unlock
      if (productId === PRODUCT_IDS.ARCHIVE_UNLOCK) {
        updates.has_archive_access = true;
      }
      
      // Expansion packs
      if (productId.includes('expansion')) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('purchased_packs')
          .eq('user_id', userId)
          .single();
        
        const packName = this.getPackNameFromProductId(productId);
        const currentPacks = profile?.purchased_packs || [];
        updates.purchased_packs = [...currentPacks, packName];
      }
      
      // Consumables (hints/clues)
      if (productId.includes('hints') || productId.includes('clues')) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('hints_remaining, clues_remaining')
          .eq('user_id', userId)
          .single();
        
        const quantity = PRODUCT_PRICES[productId]?.quantity || 0;
        
        if (productId.includes('hints')) {
          updates.hints_remaining = (profile?.hints_remaining || 0) + quantity;
        } else {
          updates.clues_remaining = (profile?.clues_remaining || 0) + quantity;
        }
      }
      
      // Update database
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Log purchase
      await this.logPurchase(userId, productId, purchaseData);
      
      // Notify listeners
      this.notifyPurchaseListeners(productId, updates);
      
      console.log('✅ Purchase activated:', productId);
      return true;
    } catch (error) {
      console.error('Failed to activate purchase:', error);
      throw error;
    }
  }

  // Restore purchases
  async restorePurchases(userId) {
    try {
      console.log('🔄 Restoring purchases...');
      
      if (window.Purchases) {
        const customerInfo = await window.Purchases.restorePurchases();
        
        // Check active entitlements
        const hasPremium = customerInfo.entitlements.active['premium'] !== undefined;
        const hasArchive = customerInfo.entitlements.active['archive'] !== undefined;
        
        // Update database
        await supabase
          .from('user_profiles')
          .update({
            is_premium: hasPremium,
            has_archive_access: hasArchive
          })
          .eq('user_id', userId);
        
        return {
          success: true,
          premium: hasPremium,
          archive: hasArchive
        };
      }
      
      return { success: false, message: 'Platform not supported' };
    } catch (error) {
      console.error('Restore failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Check subscription status
  async checkSubscriptionStatus(userId) {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_premium, premium_expires_at')
        .eq('user_id', userId)
        .single();
      
      if (!profile?.is_premium) return false;
      
      // Check if lifetime
      if (!profile.premium_expires_at) return true;
      
      // Check if expired
      const expiryDate = new Date(profile.premium_expires_at);
      const now = new Date();
      
      if (now > expiryDate) {
        // Subscription expired
        await supabase
          .from('user_profiles')
          .update({ is_premium: false })
          .eq('user_id', userId);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  // Helper: Calculate expiry date
  calculateExpiryDate(productId) {
    if (productId === PRODUCT_IDS.PREMIUM_LIFETIME) return null; // No expiry
    
    const now = new Date();
    if (productId === PRODUCT_IDS.PREMIUM_MONTHLY) {
      now.setMonth(now.getMonth() + 1);
    } else if (productId === PRODUCT_IDS.PREMIUM_YEARLY) {
      now.setFullYear(now.getFullYear() + 1);
    }
    return now.toISOString();
  }

  // Helper: Get pack name from product ID
  getPackNameFromProductId(productId) {
    const map = {
      [PRODUCT_IDS.EXPANSION_ANIMALS]: 'Animals',
      [PRODUCT_IDS.EXPANSION_NATURE]: 'Nature',
      [PRODUCT_IDS.EXPANSION_FOOD]: 'Food',
      [PRODUCT_IDS.EXPANSION_HALLOWEEN]: 'Halloween',
      [PRODUCT_IDS.EXPANSION_SPORTS]: 'Sports',
      [PRODUCT_IDS.EXPANSION_MUSIC]: 'Music',
      [PRODUCT_IDS.EXPANSION_TRAVEL]: 'Travel',
      [PRODUCT_IDS.EXPANSION_PROFESSIONS]: 'Professions'
    };
    return map[productId] || productId;
  }

  // Log purchase for analytics
  async logPurchase(userId, productId, purchaseData) {
    try {
      await supabase
        .from('purchase_logs')
        .insert({
          user_id: userId,
          product_id: productId,
          platform: purchaseData.mock ? 'web_dev' : 'app',
          transaction_id: purchaseData.transactionId || null,
          price: PRODUCT_PRICES[productId]?.price || '£0.00',
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log purchase:', error);
    }
  }

  // Purchase listeners
  addPurchaseListener(callback) {
    this.purchaseListeners.push(callback);
  }

  notifyPurchaseListeners(productId, updates) {
    this.purchaseListeners.forEach(callback => {
      try {
        callback(productId, updates);
      } catch (error) {
        console.error('Purchase listener error:', error);
      }
    });
  }
}

// Singleton instance
export const iapManager = new IAPManager();

// Convenience functions
export const initializeIAP = (userId) => iapManager.initialize(userId);
export const purchaseProduct = (productId, userId) => iapManager.purchaseProduct(productId, userId);
export const restorePurchases = (userId) => iapManager.restorePurchases(userId);
export const checkSubscription = (userId) => iapManager.checkSubscriptionStatus(userId);
