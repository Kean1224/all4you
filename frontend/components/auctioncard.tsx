'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ClockIcon, 
  CurrencyDollarIcon, 
  EyeIcon,
  HeartIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export type Auction = {
  id: string;
  title: string;
  status: string;
  startsAt?: string;
  endsAt?: string;
  endedAt?: string;
  description?: string;
  image?: string;
  currentBid?: number;
  startingPrice?: number;
  endTime?: string;
  bidCount?: number;
  viewCount?: number;
  location?: string;
  lots?: any[];
};

interface AuctionCardProps {
  auction: Auction;
  index?: number;
}

export default function AuctionCard({ auction, index = 0 }: AuctionCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isWatched, setIsWatched] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Use endTime or endsAt for calculation
  const endTimeStr = auction.endTime || auction.endsAt;

  // Calculate time remaining
  useEffect(() => {
    if (!endTimeStr) return;
    
    const calculateTimeLeft = () => {
      const endTime = new Date(endTimeStr).getTime();
      const now = new Date().getTime();
      const timeDiff = endTime - now;

      if (timeDiff <= 0) {
        setTimeLeft('Ended');
        setIsExpired(true);
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endTimeStr]);

  const handleWatchToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWatched(!isWatched);
    // TODO: Add to watchlist API call
  };

  const currentBid = auction.currentBid || auction.startingPrice || 0;
  const lotCount = auction.lots?.length || 0;
  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleString() : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      
      {/* Image Section */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        {auction.image ? (
          <Image
            src={auction.image}
            alt={auction.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center">
            <div className="text-secondary-400 text-4xl font-sora font-bold">
              ALL4YOU
            </div>
          </div>
        )}
        
        {/* Overlay Elements */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {isExpired || auction.status === 'ended' ? (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              ENDED
            </span>
          ) : (
            <span className="px-3 py-1 bg-primary-500 text-secondary-800 text-xs font-bold rounded-full animate-pulse">
              LIVE
            </span>
          )}
        </div>

        {/* Watch Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleWatchToggle}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200"
        >
          {isWatched ? (
            <HeartSolidIcon className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-white" />
          )}
        </motion.button>

        {/* Lot Count */}
        {lotCount > 0 && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-secondary-800/80 backdrop-blur-sm rounded-lg">
            <span className="text-white text-xs font-inter font-medium">
              {lotCount} {lotCount === 1 ? 'Lot' : 'Lots'}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-6">
        
        {/* Title */}
        <h3 className="font-sora font-bold text-lg sm:text-xl text-secondary-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
          {auction.title}
        </h3>

        {/* Description */}
        {auction.description && (
          <p className="text-secondary-600 text-sm font-inter mb-3 line-clamp-2">
            {auction.description}
          </p>
        )}

        {/* Location */}
        {auction.location && (
          <div className="flex items-center text-secondary-500 text-sm font-inter mb-4">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {auction.location}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center space-x-4 text-secondary-500">
            {auction.bidCount !== undefined && (
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                <span className="font-inter">{auction.bidCount} bids</span>
              </div>
            )}
            {auction.viewCount !== undefined && (
              <div className="flex items-center">
                <EyeIcon className="w-4 h-4 mr-1" />
                <span className="font-inter">{auction.viewCount} views</span>
              </div>
            )}
          </div>
        </div>

        {/* Price & Time */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-secondary-500 text-sm font-inter">
              {auction.currentBid ? 'Current Bid' : 'Starting Price'}
            </p>
            <p className="text-2xl font-sora font-bold text-secondary-800">
              R{currentBid.toLocaleString()}
            </p>
          </div>
          
          {endTimeStr && (
            <div className="text-right">
              <p className="text-secondary-500 text-sm font-inter flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                {isExpired || auction.status === 'ended' ? 'Ended' : 'Time Left'}
              </p>
              <p className={`text-lg font-sora font-bold ${
                isExpired || auction.status === 'ended' ? 'text-red-500' : 'text-primary-600'
              }`}>
                {timeLeft}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link href={`/auctions/${auction.id}`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-4 rounded-xl font-inter font-bold text-center transition-all duration-200 ${
              isExpired || auction.status === 'ended'
                ? 'bg-secondary-100 text-secondary-500 cursor-not-allowed'
                : 'bg-primary-500 text-secondary-800 hover:bg-primary-400 hover:shadow-glow'
            }`}
            disabled={isExpired || auction.status === 'ended'}
          >
            {isExpired || auction.status === 'ended' ? 'Auction Ended' : 'View & Bid'}
          </motion.button>
        </Link>
      </div>

      {/* Hover Overlay with Quick Actions */}
      <div className="absolute inset-0 bg-primary-500/95 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <Link href={`/auctions/${auction.id}`}>
              <button className="block w-full px-6 py-3 bg-white text-primary-600 rounded-lg font-inter font-bold hover:bg-secondary-50 transition-colors duration-200">
                View Details
              </button>
            </Link>
            <button 
              onClick={handleWatchToggle}
              className="block w-full px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-inter font-bold hover:bg-white hover:text-primary-600 transition-colors duration-200"
            >
              {isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
