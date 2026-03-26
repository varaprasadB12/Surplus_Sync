import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Dashboard() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [newListing, setNewListing] = useState({ restaurantName: '', itemDescription: '', quantity: '' });
  const [claimAmounts, setClaimAmounts] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    } else {
      fetchListings();
    }
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchListings = async () => {
    try {
      const response = await api.get('/inventory-service/listings/available');
      setListings(response.data);
    } catch {
      showNotification('Failed to fetch listings.', 'error');
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory-service/listings', {
        ...newListing,
        quantity: parseInt(newListing.quantity),
      });
      setNewListing({ restaurantName: '', itemDescription: '', quantity: '' });
      showNotification('Listing posted successfully!', 'success');
      fetchListings();
    } catch {
      showNotification('Failed to create listing.', 'error');
    }
  };

  const handleClaim = async (listingId) => {
    try {
      await api.post('/transaction-service/claims', {
        listingId,
        claimerName: 'Demo NGO',
        amount: claimAmounts[listingId] || 1,
      });
      showNotification('Claim submitted successfully!', 'success');
      fetchListings();
    } catch {
      showNotification('Claim Failed: Data conflict or insufficient inventory.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-700">SurplusSync Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.message}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Post Surplus Food</h2>
            <p className="text-sm text-gray-500 mb-6">Add a new listing to the marketplace</p>
            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={newListing.restaurantName}
                  onChange={(e) => setNewListing({ ...newListing, restaurantName: e.target.value })}
                  placeholder="e.g. Green Bowl Cafe"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={newListing.itemDescription}
                  onChange={(e) => setNewListing({ ...newListing, itemDescription: e.target.value })}
                  placeholder="e.g. Surplus pasta boxes"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newListing.quantity}
                  onChange={(e) => setNewListing({ ...newListing, quantity: e.target.value })}
                  placeholder="e.g. 10"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                Post Listing
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Available Feed</h2>
            <p className="text-sm text-gray-500 mb-6">Claim surplus food from nearby restaurants</p>

            {listings.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">
                No listings available right now.
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{listing.restaurantName}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{listing.itemDescription}</p>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ml-4">
                        {listing.quantity} available
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <input
                        type="number"
                        min="1"
                        max={listing.quantity}
                        value={claimAmounts[listing.id] || 1}
                        onChange={(e) => setClaimAmounts({ ...claimAmounts, [listing.id]: parseInt(e.target.value) })}
                        className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        onClick={() => handleClaim(listing.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                      >
                        Claim Food
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
