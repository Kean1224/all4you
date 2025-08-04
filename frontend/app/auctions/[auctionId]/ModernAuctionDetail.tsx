'use client';

import React, { useState, useEffect } from 'react';
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
                      <span>R{auction.depositAmount.toLocaleString()}</span>
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
                      <p><span className="font-medium">Deposit Required:</span> {auction.depositRequired ? `Yes (R${auction.depositAmount.toLocaleString()})` : 'No'}</p>
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300"
    >
      <Link href={`/auctions/${auctionId}/lots/${lot.id}`}>
        <div className="relative h-48 overflow-hidden">
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
          
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
              lot.status === 'open' ? 'bg-green-500 text-white' :
              lot.status === 'ended' ? 'bg-gray-500 text-white' :
              'bg-yellow-500 text-black'
            }`}>
              {lot.status.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{lot.title}</h3>
          {lot.description && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{lot.description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 font-bold text-lg">R{lot.currentBid.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">Current Bid</p>
            </div>
            <div className="text-right">
              <p className="text-gray-300 text-sm">{lot.bidHistory?.length || 0} bids</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
