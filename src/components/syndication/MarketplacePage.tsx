import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  TrendingUp, 
  Filter, 
  Search,
  Star,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';
import { SyndicationMarketplace } from '../../types/syndication';
import { syndicationService } from '../../services/syndicationService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

export function MarketplacePage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<SyndicationMarketplace[]>([]);
  const [filteredListings, setFilteredListings] = useState<SyndicationMarketplace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [selectedListing, setSelectedListing] = useState<SyndicationMarketplace | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState(10);

  useEffect(() => {
    loadMarketplace();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchTerm, priceFilter]);

  const loadMarketplace = async () => {
    try {
      setIsLoading(true);
      const marketplaceData = await syndicationService.getMarketplaceListings();
      setListings(marketplaceData);
    } catch (error) {
      console.error('Failed to load marketplace:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.sellerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priceFilter !== 'all') {
      filtered = filtered.filter(listing => {
        if (priceFilter === 'low') return listing.pricePerCredit < 0.90;
        if (priceFilter === 'medium') return listing.pricePerCredit >= 0.90 && listing.pricePerCredit < 0.95;
        if (priceFilter === 'high') return listing.pricePerCredit >= 0.95;
        return true;
      });
    }

    setFilteredListings(filtered);
  };

  const handlePurchase = async (listing: SyndicationMarketplace) => {
    try {
      // In real implementation, this would handle the purchase transaction
      console.log('Purchasing credits from listing:', listing.id);
      setSelectedListing(null);
      // Refresh marketplace after purchase
      loadMarketplace();
    } catch (error) {
      console.error('Failed to purchase credits:', error);
    }
  };

  const getSellerRating = (sellerId: string) => {
    // Mock seller rating - in real app, this would come from reviews
    return 4.2 + Math.random() * 0.8;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credit Marketplace</h1>
          <p className="text-gray-600 mt-2">Buy credits from other recruiters at competitive rates</p>
        </div>
        <Button variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Market Trends
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sellers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Prices</option>
              <option value="low">Under $0.90</option>
              <option value="medium">$0.90 - $0.95</option>
              <option value="high">$0.95+</option>
            </select>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Marketplace Listings */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <Card key={listing.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Premium Credits</h3>
                  <p className="text-sm text-gray-600">by {listing.sellerId}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${listing.pricePerCredit.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">per credit</div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Seller Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{getSellerRating(listing.sellerId).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{listing.totalSold} sold</span>
                  </div>
                </div>

                {/* Credit Details */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium ml-1">{listing.creditAmount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Min Order:</span>
                      <span className="font-medium ml-1">{listing.minPurchase}</span>
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={() => setSelectedListing(listing)}
                  className="w-full"
                  disabled={!listing.isActive}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Credits
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Purchase Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="font-semibold">Purchase Credits</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Seller:</span>
                  <span>{selectedListing.sellerId}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Price per credit:</span>
                  <span className="text-green-600 font-bold">${selectedListing.pricePerCredit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Available:</span>
                  <span>{selectedListing.creditAmount} credits</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <Input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(parseInt(e.target.value))}
                  min={selectedListing.minPurchase}
                  max={Math.min(selectedListing.maxPurchase, selectedListing.creditAmount)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Total: ${(purchaseAmount * selectedListing.pricePerCredit).toFixed(2)}
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => handlePurchase(selectedListing)}
                  className="flex-1"
                  disabled={purchaseAmount < selectedListing.minPurchase}
                >
                  Complete Purchase
                </Button>
                <Button variant="outline" onClick={() => setSelectedListing(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {filteredListings.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or check back later for new listings.
          </p>
        </div>
      )}
    </div>
  );
}