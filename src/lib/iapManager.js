// src/lib/iapManager.js
// RevenueCat integration for In-App Purchases

import { supabase } from './supabase';

// RevenueCat API Key (set in environment)
const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY;

// Product IDs matching your RevenueCat setup
export const PRODUCT_IDS = {
  // Premium Subscriptions
  PREMIUM_MONTHLY: 'premium_monthly',
  PREMIUM_YEARLY: 'premium_yearly',
  PREMIUM_LIFETIME: 'premium_lifetime',
  
  // Archive
  ARCHIVE_UNLOCK: 'archive_unlock',
  
  // Expansion Packs
  EXPANSION_ANIMALS: 'expansion_animals',
  EXPANSION_COUNTRIES: 'expansion_countries',
  EXPANSION_FOOD: 'expansion_food',
  EXPANSION_HALLOWEEN: 'expansion_halloween',
  EXPANSION_HOME: 'expansion_home',
  EXPANSION_JOBS: 'expansion_jobs',
  EXPANSION_SCHOOL: 'expansion_school',
  EXPANSION_SPORTS: 'expansion_sports',
  EXPANSION_WEATHER: 'expansion_weather',
  EXPANSION_WILD: 'expansion_wild',
  
  // Consumables
  FIFTEEN_CLUES: 'fifteen_clues',
  FIFTY_CLUES: 'fifty_clues',
  FIFTEEN_HINTS: 'fifteen_hints',
  FIFTY_HINTS: 'fifty_hints'
};

class IAPManager {
  constructor() {
    this.initialized = false;
  }

  // Initialize RevenueCat
  async initialize(userId) {
    if (this.initialized) return true;

    try {
      // For web preview, skip RevenueCat init
      if (typeof window.Purchases === 'undefined') {
        console.log('⚠️ RevenueCat not loaded (web preview mode)');
        return false;
      }

      await window.Purchases.configure(REVENUECAT_API_KEY, userId);
      this.initialized = true;
      console.log('✅ IAP Manager initialized');
      return true;
    } catch (error) {
      console.error('❌ IAP initialization failed:', error);
      return false;
    }
  }

  // Purchase product
  async purchaseProduct(productId, userId) {
    try {
      console.log(`🛒 Purchasing: ${productId}`);
      
      // Web preview - simulate success
      if (typeof window.Purchases === 'undefined') {
        console.log('⚠️ DEV MODE: Simulating purchase');
        await this.activatePurchase(userId, productId, { mock: true });
        return { success: true, mock: true };
      }
      
      // Real IAP via RevenueCat
      const purchase = await window.Purchases.purchaseProduct(productId);
      
      if (purchase.customerInfo) {
        await this.activatePurchase(userId, productId, purchase);
        return { success: true, purchase };
      }
      
      return { success: false, error: 'Purchase failed' };
    } catch (error) {
      console.error('Purchase failed:', error);
      
      if (error.code === 'USER_CANCELLED') {
        return { success: false, cancelled: true };
      }
      
      return { success: false, error: error.message };
    }
  }

  // Activate purchase in database
  async activatePurchase(userId, productId, purchaseData) {
    try {
      const updates = {};
      
      // Premium subscriptions
      if (productId.includes('premium')) {
        updates.is_premium = true;
        if (productId === PRODUCT_IDS.PREMIUM_LIFETIME) {
          updates.premium_expires_at = null; // Lifetime
        } else if (productId === PRODUCT_IDS.PREMIUM_MONTHLY) {
          const expiry = new Date();
          expiry.setMonth(expiry.getMonth() + 1);
          updates.premium_expires_at = expiry.toISOString();
        } else if (productId === PRODUCT_IDS.PREMIUM_YEARLY) {
          const expiry = new Date();
          expiry.setFullYear(expiry.getFullYear() + 1);
          updates.premium_expires_at = expiry.toISOString();
        }
      }
      
      // Archive unlock
      if (productId === PRODUCT_IDS.ARCHIVE_UNLOCK) {
        updates.has_archive_access = true;
      }
      
      // Expansion packs
      if (productId.includes('expansion_')) {
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
        
        if (productId === PRODUCT_IDS.FIFTEEN_HINTS) {
          updates.hints_remaining = (profile?.hints_remaining || 0) + 15;
        } else if (productId === PRODUCT_IDS.FIFTY_HINTS) {
          updates.hints_remaining = (profile?.hints_remaining || 0) + 50;
        } else if (productId === PRODUCT_IDS.FIFTEEN_CLUES) {
          updates.clues_remaining = (profile?.clues_remaining || 0) + 15;
        } else if (productId === PRODUCT_IDS.FIFTY_CLUES) {
          updates.clues_remaining = (profile?.clues_remaining || 0) + 50;
        }
      }
      
      // Update database
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      console.log('✅ Purchase activated:', productId);
      return true;
    } catch (error) {
      console.error('Failed to activate purchase:', error);
      throw error;
    }
  }

  // Get pack name from product ID
  getPackNameFromProductId(productId) {
    const map = {
      [PRODUCT_IDS.EXPANSION_ANIMALS]: 'Animals',
      [PRODUCT_IDS.EXPANSION_COUNTRIES]: 'Countries',
      [PRODUCT_IDS.EXPANSION_FOOD]: 'Food',
      [PRODUCT_IDS.EXPANSION_HALLOWEEN]: 'Halloween',
      [PRODUCT_IDS.EXPANSION_HOME]: 'Home',
      [PRODUCT_IDS.EXPANSION_JOBS]: 'Jobs',
      [PRODUCT_IDS.EXPANSION_SCHOOL]: 'School',
      [PRODUCT_IDS.EXPANSION_SPORTS]: 'Sports',
      [PRODUCT_IDS.EXPANSION_WEATHER]: 'Weather',
      [PRODUCT_IDS.EXPANSION_WILD]: 'Wild'
    };
    return map[productId] || productId;
  }

  // Restore purchases
  async restorePurchases(userId) {
    try {
      console.log('🔄 Restoring purchases...');
      
      if (typeof window.Purchases === 'undefined') {
        return { success: false, message: 'Platform not supported' };
      }
      
      const customerInfo = await window.Purchases.restorePurchases();
      
      // Check active entitlements
      const hasPremium = customerInfo.entitlements.active['premium'] !== undefined;
      const hasArchive = customerInfo.entitlements.active['archive'] !== undefined;
      
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
    } catch (error) {
      console.error('Restore failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Singleton instance
export const iapManager = new IAPManager();

// Convenience functions
export const initializeIAP = (userId) => iapManager.initialize(userId);
export const purchaseProduct = (productId, userId) => iapManager.purchaseProduct(productId, userId);
export const restorePurchases = (userId) => iapManager.restorePurchases(userId);
