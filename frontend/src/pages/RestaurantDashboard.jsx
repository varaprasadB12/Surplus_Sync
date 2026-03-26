import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ restaurantName: '', itemDescription: '', quantity: '', price: '' });
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/inventory-service/listings', {
        restaurantName: form.restaurantName,
        itemDescription: form.itemDescription,
        quantity: parseInt(form.quantity),
        price: form.price ? parseFloat(form.price) : null,
      });
      setForm({ restaurantName: '', itemDescription: '', quantity: '', price: '' });
      showNotification('Listing posted successfully!', 'success');
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
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
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

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Post Surplus Food</h2>
          <p className="text-sm text-gray-500 mb-8">List your surplus inventory for NGOs and consumers to claim.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  name="restaurantName"
                  required
                  value={form.restaurantName}
                  onChange={handleChange}
                  placeholder="e.g. Green Bowl Cafe"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
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
      </main>
    </div>
  );
}
