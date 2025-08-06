'use client';

import React, { useState, useEffect, useRef } from 'react';
import BidNotifications from '../../components/BidNotifications';
// WebSocket URL (adjust if needed)
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5051';
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
  // --- WebSocket: Live Bidding ---
  useEffect(() => {
    if (!auctionId) return;
    if (wsRef.current) wsRef.current.close();
    const ws = new window.WebSocket(`${WS_URL}/?auctionId=${auctionId}`);
    wsRef.current = ws;
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
      } catch (e) {}
    };
    ws.onerror = () => {};
    ws.onclose = () => {};
    return () => { ws.close(); };
  }, [auctionId]);
  // Remove notification by id
  const removeNotification = (id: any) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Place bid
  const handlePlaceBid = async (lotId: string, currentBid: number, increment: number) => {
    setBiddingLoading(lotId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/${lotId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: currentBid + increment }),
        credentials: 'include',
      });
      const data = await res.json();
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
            message: data.message || 'Bid failed',
            type: 'warning',
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (e) {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          message: 'Network error placing bid',
          type: 'warning',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setBiddingLoading(null);
    }
  };

  // Watchlist
  const toggleWatchlist = (lotId: string) => {
    setWatchlist((prev) =>
      prev.includes(lotId) ? prev.filter((id) => id !== lotId) : [...prev, lotId]
    );
  };

  // Description toggle
  const toggleDescription = (lotId: string) => {
    setExpandedDescriptions((prev) => ({ ...prev, [lotId]: !prev[lotId] }));
  };

  // Image modal
  const openImageModal = (images: string[], currentIndex: number, lotTitle: string) => setImageModal({ isOpen: true, images, currentIndex, lotTitle });
  const closeImageModal = () => setImageModal({ isOpen: false, images: [], currentIndex: 0, lotTitle: '' });
  const navigateModalImage = (direction: 'prev' | 'next') => {
    setImageModal((prev) => {
      const newIndex = direction === 'next'
        ? (prev.currentIndex + 1) % prev.images.length
        : (prev.currentIndex - 1 + prev.images.length) % prev.images.length;
      return { ...prev, currentIndex: newIndex };
    });
  };
  const params = useParams();
  const auctionId = params.auctionId as string;
  
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWatched, setIsWatched] = useState(false);
  const [activeTab, setActiveTab] = useState<'lots' | 'details'>('lots');

  useEffect(() => {
    fetchAuction();
  }, [auctionId]);

  const fetchAuction = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions/${auctionId}`);
      
      if (!response.ok) {
        throw new Error('Auction not found');
      }
      
      const auctionData = await response.json();
      setAuction(auctionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load auction');
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

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Auction Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'The auction you\'re looking for doesn\'t exist.'}</p>
          <Link href="/auctions" className="bg-green-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-300 transition-colors">
            Browse Auctions
          </Link>
        </div>
      </div>
    );
  }

  const status = getAuctionStatus();
  const auctionImage = auction.auctionImage || '/images/default-auction.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Bid Notifications */}
      <BidNotifications notifications={notifications} onRemove={removeNotification} />
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/auctions" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Auctions
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWatchToggle}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isWatched ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-white" />
              )}
              <span className="text-white">{isWatched ? 'Watching' : 'Watch Auction'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Auction Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <Image
          src={auctionImage}
          alt={auction.title}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/default-auction.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                {getStatusBadge(status)}
                <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-2">
                  {auction.title}
                </h1>
                {auction.description && (
                  <p className="text-xl text-gray-300 max-w-2xl">
                    {auction.description}
                  </p>
                )}
              </div>
              
              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 min-w-[300px]">
                <h3 className="text-white font-semibold mb-4">Auction Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <CalendarIcon className="w-4 h-4 text-green-400" />
                    <span className="font-medium">Starts:</span>
                    <span>{formatDate(auction.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <ClockIcon className="w-4 h-4 text-red-400" />
                    <span className="font-medium">Ends:</span>
                    <span>{formatDate(auction.endTime)}</span>
                  </div>
                  {auction.location && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPinIcon className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">Location:</span>
                      <span>{auction.location}</span>
                    </div>
                  )}
                  {auction.depositRequired && (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span className="font-medium">Deposit Required:</span>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('lots')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'lots'
                ? 'bg-green-400 text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Lots ({auction.lots.length})
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'details'
                ? 'bg-green-400 text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {auction.lots.map((lot, index) => (
                    <LotCard key={lot.id} lot={lot} auctionId={auction.id} index={index} />
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
                  <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Lots Available</h3>
                  <p className="text-gray-400">This auction doesn't have any lots yet. Check back soon!</p>
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
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Auction Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Bidding Information</h4>
                    <div className="space-y-2 text-gray-300">
                      <p><span className="font-medium">Bid Increment:</span> R{auction.increment}</p>
                      <p><span className="font-medium">Total Lots:</span> {auction.lots.length}</p>
                      <p><span className="font-medium">Deposit Required:</span> {auction.depositRequired ? `Yes (R${(auction.depositAmount || 0).toLocaleString()})` : 'No'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Auction Stats</h4>
                    <div className="space-y-2 text-gray-300">
                      <p><span className="font-medium">Created:</span> {new Date(auction.createdAt).toLocaleDateString()}</p>
                      <p><span className="font-medium">Views:</span> {auction.viewCount || 0}</p>
                      <p><span className="font-medium">Status:</span> <span className="capitalize">{status}</span></p>
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

// Lot Card Component
function LotCard({ lot, auctionId, index }: { lot: Lot; auctionId: string; index: number }) {
  // Images array for modal/gallery support
  const images = lot.imageUrl ? [lot.imageUrl] : [];
  const lotNumber = index + 1;
  const lotEndTime = lot.endTime || '';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 relative"
    >
      {/* Timer and Watchlist */}
      <div className="absolute top-3 left-3 flex gap-2 items-center z-10">
        <LotTimer endTime={lotEndTime} lotNumber={lotNumber} />
      </div>
      <button
        className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold border z-10 ${watchlist.includes(lot.id) ? 'bg-yellow-200 border-yellow-400 text-yellow-900' : 'bg-white/20 border-gray-300 text-gray-200 hover:bg-white/30'}`}
        onClick={() => toggleWatchlist(lot.id)}
      >
        {watchlist.includes(lot.id) ? '★ Watchlisted' : '☆ Watchlist'}
      </button>
      <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => openImageModal(images, 0, lot.title)}>
        {lot.imageUrl ? (
          <Image
            src={lot.imageUrl}
            alt={lot.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <TagIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{lot.title}</h3>
        {lot.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {expandedDescriptions[lot.id] ? lot.description : (lot.description?.slice(0, 80) || '')}
            {lot.description && lot.description.length > 80 && (
              <button className="ml-2 text-green-400 underline text-xs" onClick={e => { e.stopPropagation(); toggleDescription(lot.id); }}>
                {expandedDescriptions[lot.id] ? 'Show less' : 'Read more'}
              </button>
            )}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="text-gray-400 text-xs">Current Bid</div>
            <div className="text-lg font-bold text-green-400">R{(lot.currentBid || 0).toLocaleString()}</div>
            <div className="text-xs text-gray-500">Min Increment: R{lot.bidIncrement || 100}</div>
          </div>
          <button
            className={`px-4 py-2 rounded-lg font-bold text-white shadow transition-all ${biddingLoading === lot.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            disabled={biddingLoading === lot.id}
            onClick={() => handlePlaceBid(lot.id, lot.currentBid, lot.bidIncrement || 100)}
          >
            {biddingLoading === lot.id ? 'Bidding...' : 'Bid'}
          </button>
        </div>
        <div className="text-right text-gray-300 text-xs mt-2">{lot.bidHistory?.length || 0} bids</div>
      </div>
    </motion.div>
  );
  // Image Modal
  // Only render once at the bottom of the main component
  // (not per lot)
  // ...existing code...
  {imageModal.isOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-lg w-full relative flex flex-col items-center">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500" onClick={closeImageModal}>✕</button>
        <div className="mb-2 font-bold text-lg">{imageModal.lotTitle}</div>
        <img src={imageModal.images[imageModal.currentIndex]} alt="Lot" className="max-h-96 w-auto object-contain mb-2" />
        <div className="flex gap-4 mt-2">
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => navigateModalImage('prev')}>Prev</button>
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => navigateModalImage('next')}>Next</button>
        </div>
        <div className="mt-2 text-xs text-gray-500">Image {imageModal.currentIndex + 1} of {imageModal.images.length}</div>
      </div>
    </div>
  )}
}
