// --- Imports ---
'use client';
import React, { useEffect, useRef } from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import BidNotifications from '../../components/BidNotifications';

// WebSocket URL (adjust if needed)
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5051';

// --- Timer Component ---
// --- Imports ---
'use client';
import ModernAuctionDetail from './ModernAuctionDetail';
    const timer = setInterval(() => {
// --- Main Auction Page Component ---
export default function Page() {
  return <ModernAuctionDetail />;
}
            const lotNumber = idx + 1;
            const images = lot.images || [];
            const currentImage = images[(currentImageIndex[lot._id] || 0) % images.length] || '/placeholder.png';
            const isHighest = isUserHighestBidder(lot);
            return (
              <div key={lot._id} className="bg-white rounded-xl shadow-lg p-4 flex flex-col relative border-2 border-blue-100 hover:border-blue-400 transition-all">
                {/* Lot Number and Timer */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-blue-700">Lot #{lotNumber}</span>
                  <LotTimer endTime={lotEndTime} lotNumber={lotNumber} />
                </div>
                {/* Lot Image */}
                <div className="relative w-full h-48 mb-2 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                  <img
                    src={currentImage}
                    alt={lot.name}
                    className="object-contain h-full w-full cursor-pointer"
                    onClick={() => openImageModal(images, currentImageIndex[lot._id] || 0, lot.name)}
                  />
                  {images.length > 1 && (
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <button className="bg-white/80 rounded-full p-1 shadow" onClick={() => navigateImage(lot._id, 'prev', images)}>&lt;</button>
                      <button className="bg-white/80 rounded-full p-1 shadow" onClick={() => navigateImage(lot._id, 'next', images)}>&gt;</button>
                    </div>
                  )}
                </div>
                {/* Lot Name */}
                <div className="text-xl font-semibold text-gray-900 mb-1 truncate" title={lot.name}>{lot.name}</div>
                {/* Lot Description */}
                <div className="text-gray-700 text-sm mb-2">
                  {expandedDescriptions[lot._id] ? lot.description : (lot.description?.slice(0, 80) || '')}
                  {lot.description && lot.description.length > 80 && (
                    <button className="ml-2 text-blue-500 underline text-xs" onClick={() => toggleDescription(lot._id)}>
                      {expandedDescriptions[lot._id] ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
                {/* Current Bid and Bid Button */}
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <div className="text-gray-600 text-xs">Current Bid</div>
                    <div className="text-lg font-bold text-green-700">R {lot.currentBid?.toLocaleString() || '0'}</div>
                    <div className="text-xs text-gray-500">Min Increment: R {lot.bidIncrement || 100}</div>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-lg font-bold text-white shadow transition-all ${isHighest ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    disabled={isHighest || biddingLoading === lot._id}
                    onClick={() => handlePlaceBid(lot._id, lot.currentBid, lot.bidIncrement)}
                  >
                    {isHighest ? 'You are highest' : biddingLoading === lot._id ? 'Bidding...' : 'Bid'}
                  </button>
                </div>
                {/* Watchlist Button */}
                <button
                  className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold border ${watchlist.includes(lot._id) ? 'bg-yellow-200 border-yellow-400 text-yellow-900' : 'bg-white border-gray-300 text-gray-500'}`}
                  onClick={() => toggleWatchlist(lot._id)}
                >
                  {watchlist.includes(lot._id) ? '★ Watchlisted' : '☆ Watchlist'}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
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
    </main>
  );
}
