import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const formatPrice = (price) => {
  if (price === null || price === undefined || price === 0) return 'Free';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ itemDescription: '', quantity: '', price: '' });
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [myListings, setMyListings] = useState([]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    }
  }, []);

  const fetchMyListings = async () => {
    try {
      const response = await api.get('/inventory-service/listings');
      setMyListings(response.data);
    } catch {
      // silently fail — history table is non-critical
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const parsedPrice = form.price !== '' ? parseFloat(form.price) : null;
    try {
      await api.post('/inventory-service/listings', {
        itemDescription: form.itemDescription,
        quantity: parseInt(form.quantity, 10),
        price: parsedPrice !== null && !isNaN(parsedPrice) ? parsedPrice : null,
      });
      setForm({ itemDescription: '', quantity: '', price: '' });
      showNotification('Listing posted successfully!', 'success');
      fetchMyListings();
    } catch {
      showNotification('Failed to post listing. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-green-700">SurplusSync</h1>
            <p className="text-xs text-gray-400 mt-0.5">Restaurant Portal</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.message}
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Post Surplus Food</h2>
          <p className="text-sm text-gray-500 mb-8">List your surplus inventory for NGOs and consumers to claim.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Description</label>
                <input
                  type="text"
                  name="itemDescription"
                  required
                  value={form.itemDescription}
                  onChange={handleChange}
                  placeholder="e.g. Surplus pasta boxes"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  required
                  min="1"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price <span className="text-gray-400 font-normal">(leave blank for free)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Posting...' : 'Post Listing'}
            </button>
          </form>
        </div>

        {myListings.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-gray-800 mb-1">My Active Inventory</h2>
            <p className="text-sm text-gray-500 mb-4">Listings you have posted in this session.</p>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Item Description</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">Total Posted</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">Qty Remaining</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">Price</th>
                    <th className="text-center px-5 py-3 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-800">{listing.itemDescription}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{listing.quantity}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{listing.quantity}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{formatPrice(listing.price)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          listing.status === 'AVAILABLE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {listing.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
