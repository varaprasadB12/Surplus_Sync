import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const formatPrice = (price) => {
  if (price === null || price === undefined || price === 0) return 'Free';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

export default function ConsumerDashboard() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [notification, setNotification] = useState(null);
  const [claimingId, setClaimingId] = useState(null);

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
      showNotification('Failed to load listings.', 'error');
    }
  };

  const handleClaim = async (listingId) => {
    setClaimingId(listingId);
    try {
      await api.post('/transaction-service/claims', {
        listingId,
        amount: 1,
      });
      showNotification('Claimed successfully!', 'success');
      fetchListings();
    } catch (err) {
      if (err.response?.status === 409) {
        showNotification('Claim failed: Data conflict or insufficient inventory.', 'error');
      } else {
        showNotification('Claim failed. Please try again.', 'error');
      }
    } finally {
      setClaimingId(null);
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
          <div>
            <h1 className="text-xl font-bold text-green-700">SurplusSync</h1>
            <p className="text-xs text-gray-400 mt-0.5">Consumer Feed</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchListings}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.message}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Available Surplus Food</h2>
          <p className="text-gray-500 mt-1">Claim food from nearby restaurants before it goes to waste.</p>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <p className="text-gray-400 text-lg">No listings available right now.</p>
            <p className="text-gray-300 text-sm mt-1">Check back soon or ask a restaurant to post surplus food.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="bg-green-50 px-6 pt-6 pb-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{listing.restaurantName}</h3>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ml-3 whitespace-nowrap ${listing.price ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {formatPrice(listing.price)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">{listing.itemDescription}</p>
                </div>

                <div className="px-6 py-4 flex items-center justify-between flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-800">{listing.quantity}</span>
                    <span className="text-sm text-gray-400">available</span>
                  </div>
                  <button
                    onClick={() => handleClaim(listing.id)}
                    disabled={claimingId === listing.id}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                  >
                    {claimingId === listing.id ? 'Claiming...' : 'Claim'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
