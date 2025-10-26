'use client';

import { useEffect } from 'react';

/**
 * Clears wallet connection cache only on initial app load
 * Preserves wallet connection across route navigation
 */
export function CacheClearer() {
  useEffect(() => {
    // Only clear cache if this is the first time the app is loaded
    if (typeof window !== 'undefined') {
      const hasClearedBefore = sessionStorage.getItem('cache-cleared');
      
      if (!hasClearedBefore) {
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('wagmi') || key?.startsWith('connectkit') || key?.includes('wallet')) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log('🧹 Cleared:', key);
        });
        
        if (keysToRemove.length > 0) {
          console.log('✅ Cache cleared - fresh wallet connection required');
        }
        
        // Mark that we've cleared the cache for this session
        sessionStorage.setItem('cache-cleared', 'true');
      }
    }
  }, []);

  return null;
}
