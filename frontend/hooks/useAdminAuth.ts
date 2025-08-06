'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ADMIN AUTH DISABLED FOR TESTING - always authenticated
export function useAdminAuth() {
  return {
    isAuthenticated: true,
    loading: false,
    logout: () => {},
  };
}
