"use client";

// Top-level LotCard component to fix React hook violation
function LotCard({
  lot,
  auctionId,
  index,
  watchlist,
  toggleWatchlist,
  expandedDescriptions,
  toggleDescription,
  biddingLoading,
  handlePlaceBid,
  openImageModal
}: {
  lot: Lot;
  auctionId: string;
  index: number;
  watchlist: string[];
  toggleWatchlist: (lotId: string) => void;
  expandedDescriptions: { [key: string]: boolean };
  toggleDescription: (lotId: string) => void;
  biddingLoading: string | null;
  handlePlaceBid: (lotId: string, currentBid: number, increment: number) => void;
  openImageModal: (images: string[], currentIndex: number, lotTitle: string) => void;
}) {
  const images = lot.imageUrl ? [lot.imageUrl] : [];
  const lotNumber = index + 1;
  const lotEndTime = lot.endTime || '';
  return (
    <motion.div
      key={lot.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl overflow-hidden hover:bg-white/30 hover:shadow-2xl transition-all duration-300 relative shadow-lg"
    >
      {/* Timer and Watchlist */}
      <div className="absolute top-3 left-3 flex gap-2 items-center z-10">
        <LotTimer endTime={lotEndTime} lotNumber={lotNumber} />
      </div>
      <button
        className={`absolute top-3 right-3 px-3 py-1 rounded-xl text-xs font-bold border-2 z-10 shadow ${watchlist.includes(lot.id) ? 'bg-yellow-200 border-yellow-400 text-yellow-900' : 'bg-white/30 border-white/50 text-gray-800 hover:bg-white/50'}`}
        onClick={() => toggleWatchlist(lot.id)}
      >
        {watchlist.includes(lot.id) ? '★ Watchlisted' : '☆ Watchlist'}
      </button>
      <div className="relative h-52 overflow-hidden cursor-pointer group" onClick={() => openImageModal(images, 0, lot.title)}>
        {lot.imageUrl ? (
          <Image
            src={lot.imageUrl}
            alt={lot.title || 'Auction Lot Image'}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <TagIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-7 flex flex-col h-full">
        <h3 className="text-xl font-extrabold text-gray-900 mb-2 line-clamp-2 drop-shadow-lg">{lot.title}</h3>
        {lot.description && (
          <p className="text-gray-700 text-base mb-4 line-clamp-2 font-light">
            {expandedDescriptions[lot.id] ? lot.description : (lot.description?.slice(0, 80) || '')}
            {lot.description && lot.description.length > 80 && (
              <button className="ml-2 text-green-600 underline text-xs font-semibold" onClick={e => { e.stopPropagation(); toggleDescription(lot.id); }}>
                {expandedDescriptions[lot.id] ? 'Show less' : 'Read more'}
              </button>
            )}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="text-gray-500 text-xs">Current Bid</div>
            <div className="text-xl font-extrabold text-green-600">R{(lot.currentBid || 0).toLocaleString()}</div>
            <div className="text-xs text-gray-400">Min Increment: R{lot.bidIncrement || 100}</div>
          </div>
          <button
            className={`px-5 py-2 rounded-xl font-bold text-white shadow-lg transition-all text-base ${biddingLoading === lot.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800'}`}
            disabled={biddingLoading === lot.id}
            onClick={() => handlePlaceBid(lot.id, lot.currentBid, lot.bidIncrement || 100)}
          >
            {biddingLoading === lot.id ? 'Bidding...' : 'Bid'}
          </button>
        </div>
        <div className="text-right text-gray-500 text-xs mt-2">{lot.bidHistory?.length || 0} bids</div>
      </div>
    </motion.div>
  );
}
'use client';

import React, { useState, useEffect, useRef } from 'react';
// Helper: Scroll to notifications for accessibility
function scrollToNotifications() {
  const el = document.getElementById('auction-notifications');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
import BidNotifications from '../../components/BidNotifications';
// WebSocket URL for local development (adjust if needed)
// Make sure to set NEXT_PUBLIC_WS_URL in your .env.local for production or custom setups
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5051';

// API URL for local development
// Make sure to set NEXT_PUBLIC_API_URL in your .env.local for production or custom setups
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
// Timer component for each lot
function LotTimer({ endTime, lotNumber }: { endTime: string; lotNumber: number }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;
      if (difference <= 0) {
        setTimeLeft('ENDED');
        setIsExpired(true);
        clearInterval(timer);
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);
  return (
    <div className={`px-2 py-1 rounded-lg font-mono text-xs font-bold ${isExpired ? 'bg-red-500 text-white' : 'bg-green-900 text-green-200'}`}>
      {isExpired ? '⏰ ENDED' : `🕒 ${timeLeft}`}
    </div>
  );
}
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  TagIcon,
  EyeIcon,
  HeartIcon,
  ArrowLeftIcon,
  TrophyIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

type Lot = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  currentBid: number;
  startingPrice?: number;
  status: 'open' | 'ended' | 'pending';
  bidHistory?: any[];
  bidIncrement?: number;
  endTime?: string;
};

type Auction = {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  depositRequired: boolean;
  depositAmount: number;
  auctionImage?: string;
  increment: number;
  lots: Lot[];
  createdAt: string;
  status?: string;
  viewCount?: number;
};

export default function AuctionDetailPage() {
  // --- Advanced Logic State ---
  const [notifications, setNotifications] = useState<any[]>([]);
  const [biddingLoading, setBiddingLoading] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [imageModal, setImageModal] = useState({ isOpen: false, images: [], currentIndex: 0, lotTitle: '' });
  const [expandedDescriptions, setExpandedDescriptions] = useState<{[key: string]: boolean}>({});
  const wsRef = useRef<WebSocket | null>(null);
  const params = useParams();
  const auctionId = params.auctionId as string;
  // --- WebSocket: Live Bidding ---
  useEffect(() => {
    if (!auctionId) return;
    if (wsRef.current) wsRef.current.close();
    let ws;
    try {
      ws = new window.WebSocket(`${WS_URL}/?auctionId=${auctionId}`);
      wsRef.current = ws;
    } catch (e) {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          message: 'WebSocket connection failed: ' + (e instanceof Error ? e.message : ''),
          type: 'error',
          timestamp: Date.now(),
        },
      ]);
      return;
    }
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'bid_update' && data.lotId && data.newBid) {
          setAuction((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              lots: prev.lots.map(lot =>
                lot.id === data.lotId ? { ...lot, currentBid: data.newBid, bidHistory: data.bidHistory } : lot
              )
            };
          });
          setNotifications((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              message: `New bid on Lot: R ${data.newBid.toLocaleString()}`,
              type: data.isUserOutbid ? 'outbid' : 'success',
              timestamp: Date.now(),
            },
          ]);
        }
        if (data.type === 'lot_won' && data.lotId) {
          setNotifications((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              message: `You won Lot!`,
              type: 'win',
              timestamp: Date.now(),
            },
          ]);
        }
      } catch (e) {
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            message: 'WebSocket message error: ' + (e instanceof Error ? e.message : ''),
            type: 'error',
            timestamp: Date.now(),
          },
        ]);
      }
    };
    ws.onerror = (event) => {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          message: 'WebSocket error: ' + (event && event.message ? event.message : ''),
          type: 'error',
          timestamp: Date.now(),
        },
      ]);
    };
    ws.onclose = (event) => {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          message: 'WebSocket closed' + (event && event.reason ? ': ' + event.reason : ''),
          type: 'warning',
          timestamp: Date.now(),
        },
      ]);
    };
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [auctionId]);
  // Remove notification by id
  const removeNotification = (id: any) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Place bid
  const handlePlaceBid = async (lotId: string, currentBid: number, increment: number) => {
    setBiddingLoading(lotId);
    try {
      const res = await fetch(`${API_URL}/api/lots/${lotId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: currentBid + increment }),
        credentials: 'include',
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            message: 'Invalid server response when placing bid',
            type: 'error',
            timestamp: Date.now(),
          },
        ]);
        return;
      }
      if (res.ok && data.success) {
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            message: `Bid placed on Lot!`,
            type: 'success',
            timestamp: Date.now(),
          },
        ]);
      } else {
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            message: (data && data.message) ? data.message : 'Bid failed',
            type: 'error',
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (e) {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          message: 'Network error placing bid: ' + (e instanceof Error ? e.message : ''),
          type: 'error',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setBiddingLoading(null);
    }
  };

  // Watchlist (persist to localStorage)
  useEffect(() => {
    // Load watchlist from localStorage on mount
    try {
      const stored = localStorage.getItem('auction_watchlist');
      if (stored) setWatchlist(JSON.parse(stored));
    } catch (e) {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          message: 'Failed to load watchlist: ' + (e instanceof Error ? e.message : ''),
          type: 'error',
          timestamp: Date.now(),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    // Save watchlist to localStorage on change
    try {
      localStorage.setItem('auction_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          message: 'Failed to save watchlist: ' + (e instanceof Error ? e.message : ''),
          type: 'error',
          timestamp: Date.now(),
        },
      ]);
    }
  }, [watchlist]);

  const toggleWatchlist = (lotId: string) => {
    setWatchlist((prev) =>
      prev.includes(lotId) ? prev.filter((id) => id !== lotId) : [...prev, lotId]
    );
  };

  // Description toggle
  const toggleDescription = (lotId: string) => {
    setExpandedDescriptions((prev) => ({ ...prev, [lotId]: !prev[lotId] }));
  };

  // Image modal (with accessibility improvements)
  const openImageModal = (images: string[], currentIndex: number, lotTitle: string) => {
    setImageModal({ isOpen: true, images, currentIndex, lotTitle });
    setTimeout(() => {
      const modal = document.getElementById('image-modal');
      if (modal) modal.focus();
    }, 100);
  };
  const closeImageModal = () => setImageModal({ isOpen: false, images: [], currentIndex: 0, lotTitle: '' });
  const navigateModalImage = (direction: 'prev' | 'next') => {
    setImageModal((prev) => {
      const newIndex = direction === 'next'
        ? (prev.currentIndex + 1) % prev.images.length
        : (prev.currentIndex - 1 + prev.images.length) % prev.images.length;
      return { ...prev, currentIndex: newIndex };
    });
  };
  // removed duplicate params and auctionId declarations
  
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isWatched, setIsWatched] = useState(false);
  const [activeTab, setActiveTab] = useState<'lots' | 'details'>('lots');

  useEffect(() => {
    fetchAuction();
    // eslint-disable-next-line
  }, [auctionId, retryCount]);

  const fetchAuction = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/auctions/${auctionId}`);
      if (!response.ok) {
        setError('Auction not found (server returned ' + response.status + ')');
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            message: 'Auction not found (server returned ' + response.status + ')',
            type: 'error',
            timestamp: Date.now(),
          },
        ]);
        setTimeout(scrollToNotifications, 100);
        return;
      }
      let auctionData;
      try {
        auctionData = await response.json();
      } catch (jsonErr) {
        setError('Invalid server response');
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            message: 'Invalid server response',
            type: 'error',
            timestamp: Date.now(),
          },
        ]);
        setTimeout(scrollToNotifications, 100);
        return;
      }
      setAuction(auctionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load auction');
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          message: 'Failed to load auction: ' + (err instanceof Error ? err.message : ''),
          type: 'error',
          timestamp: Date.now(),
        },
      ]);
      setTimeout(scrollToNotifications, 100);
    } finally {
      setLoading(false);
    }
  };

  const getAuctionStatus = () => {
    if (!auction) return 'unknown';
    
    const now = new Date().getTime();
    const startTime = new Date(auction.startTime).getTime();
    const endTime = new Date(auction.endTime).getTime();

    if (now < startTime) return 'upcoming';
    if (now >= startTime && now < endTime) return 'live';
    return 'ended';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <span className="px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded-full">
            UPCOMING
          </span>
        );
      case 'live':
        return (
          <span className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-full animate-pulse">
            LIVE AUCTION
          </span>
        );
      case 'ended':
        return (
          <span className="px-4 py-2 bg-gray-500 text-white text-sm font-bold rounded-full">
            ENDED
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleWatchToggle = () => {
    setIsWatched(!isWatched);
    // TODO: Add to watchlist API call
  };

  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-400 text-black px-6 py-4 rounded-lg font-semibold shadow-lg mb-6">
            <span className="text-lg">Warning: <b>NEXT_PUBLIC_API_URL</b> is not set. Using <b>http://localhost:5000</b> for API calls. Set this in your <b>.env.local</b> for custom or production environments.</span>
          </div>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading auction details...</p>
        </div>
      </div>
    );
  }

  // Error Banner with Retry
  if (error || !auction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div id="auction-notifications" />
          <div className="mb-6">
            <div className="bg-red-600 text-white px-6 py-4 rounded-lg font-semibold shadow-lg flex flex-col items-center gap-2">
              <span className="text-lg">{error || 'The auction you\'re looking for doesn\'t exist.'}</span>
              <button
                className="mt-2 px-4 py-2 bg-white text-red-700 rounded font-bold hover:bg-gray-100 transition-colors"
                onClick={() => { setRetryCount((c) => c + 1); setError(null); }}
                aria-label="Retry loading auction"
              >
                Retry
              </button>
            </div>
          </div>
          <Link href="/auctions" className="bg-green-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-300 transition-colors">
            Browse Auctions
          </Link>
        </div>
      </div>
    );
  }

  const status = getAuctionStatus();
  const auctionImage = auction.auctionImage || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526]">
      {/* Bid Notifications */}
      <div id="auction-notifications" />
      <BidNotifications notifications={notifications} onRemove={removeNotification} />
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/auctions" className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors font-semibold">
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Auctions
            </Link>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleWatchToggle}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-400/80 to-green-600/80 hover:from-green-500 hover:to-green-700 text-black rounded-xl font-bold shadow-lg transition-all border border-green-300/40"
            >
              {isWatched ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-black" />
              )}
              <span>{isWatched ? 'Watching' : 'Watch Auction'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Auction Hero Section */}
      <div className="relative h-96 overflow-hidden rounded-b-3xl shadow-2xl">
        <Image
          src={auctionImage}
          alt={auction.title || 'Auction Image'}
          fill
          className="object-cover scale-105 blur-[1px] brightness-75"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
                                  target.src = '';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                {getStatusBadge(status)}
                <h1 className="text-5xl md:text-6xl font-extrabold text-white mt-4 mb-2 drop-shadow-lg tracking-tight">
                  {auction.title}
                </h1>
                {auction.description && (
                  <p className="text-2xl text-gray-200 max-w-2xl font-light drop-shadow">
                    {auction.description}
                  </p>
                )}
              </div>
              <div className="bg-white/20 backdrop-blur-2xl rounded-2xl p-8 min-w-[320px] shadow-xl border border-white/30">
                <h3 className="text-gray-900 font-bold mb-4 text-lg">Auction Details</h3>
                <div className="space-y-3 text-base">
                  <div className="flex items-center gap-2 text-gray-800">
                    <CalendarIcon className="w-4 h-4 text-green-500" />
                    <span className="font-semibold">Starts:</span>
                    <span>{formatDate(auction.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-800">
                    <ClockIcon className="w-4 h-4 text-red-500" />
                    <span className="font-semibold">Ends:</span>
                    <span>{formatDate(auction.endTime)}</span>
                  </div>
                  {auction.location && (
                    <div className="flex items-center gap-2 text-blue-800">
                      <MapPinIcon className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold">Location:</span>
                      <span>{auction.location}</span>
                    </div>
                  )}
                  {auction.depositRequired && (
                    <div className="flex items-center gap-2 text-yellow-700">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span className="font-semibold">Deposit Required:</span>
                      <span>R{(auction.depositAmount || 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => setActiveTab('lots')}
            className={`px-7 py-3 rounded-2xl font-bold text-lg shadow transition-all border-2 ${
              activeTab === 'lots'
                ? 'bg-gradient-to-r from-green-400 to-green-600 text-black border-green-400 shadow-lg scale-105'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:scale-105'
            }`}
          >
            Lots ({auction.lots.length})
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-7 py-3 rounded-2xl font-bold text-lg shadow transition-all border-2 ${
              activeTab === 'details'
                ? 'bg-gradient-to-r from-green-400 to-green-600 text-black border-green-400 shadow-lg scale-105'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:scale-105'
            }`}
          >
            Auction Details
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'lots' && (
            <motion.div
              key="lots"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {auction.lots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {auction.lots.map((lot, index) => (
                    <LotCard
                      key={lot.id}
                      lot={lot}
                      auctionId={auction.id}
                      index={index}
                      watchlist={watchlist}
                      toggleWatchlist={toggleWatchlist}
                      expandedDescriptions={expandedDescriptions}
                      toggleDescription={toggleDescription}
                      biddingLoading={biddingLoading}
                      handlePlaceBid={handlePlaceBid}
                      openImageModal={openImageModal}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-16 text-center shadow-xl">
                  <TrophyIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-2">No Lots Available</h3>
                  <p className="text-gray-600">This auction doesn't have any lots yet. Check back soon!</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-12 shadow-xl"
            >
              <h3 className="text-3xl font-extrabold text-gray-900 mb-8">Auction Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Bidding Information</h4>
                    <div className="space-y-2 text-gray-700 text-base">
                      <p><span className="font-semibold">Bid Increment:</span> R{auction.increment}</p>
                      <p><span className="font-semibold">Total Lots:</span> {auction.lots.length}</p>
                      <p><span className="font-semibold">Deposit Required:</span> {auction.depositRequired ? `Yes (R${(auction.depositAmount || 0).toLocaleString()})` : 'No'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Auction Stats</h4>
                    <div className="space-y-2 text-gray-700 text-base">
                      <p><span className="font-semibold">Created:</span> {new Date(auction.createdAt).toLocaleDateString()}</p>
                      <p><span className="font-semibold">Views:</span> {auction.viewCount || 0}</p>
                      <p><span className="font-semibold">Status:</span> <span className="capitalize">{status}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Lot Card Component moved inside AuctionDetailPage for access to state/handlers
