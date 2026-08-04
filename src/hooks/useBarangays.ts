import { useState, useEffect } from 'react';
import { Barangay } from '../types';
import { barangaysService } from '../services/supabaseService';

// Cached barangays to avoid redundant fetches
let cachedBarangays: Barangay[] | null = null;

export function useBarangays() {
  const [barangays, setBarangays] = useState<Barangay[]>(cachedBarangays || []);
  const [isLoading, setIsLoading] = useState(!cachedBarangays);

  useEffect(() => {
    if (cachedBarangays) return;
    
    barangaysService.getAll().then((data) => {
      cachedBarangays = data;
      setBarangays(data);
      setIsLoading(false);
    }).catch((err) => {
      console.error('Failed to load barangays:', err);
      setIsLoading(false);
    });
  }, []);

  return { barangays, isLoading };
}

// For components that just need the name list synchronously
export function getBarangayNames(barangays: Barangay[]): string[] {
  return barangays.map((b) => b.name);
}
