import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import RestaurantDashboard from './pages/RestaurantDashboard';
import ConsumerDashboard from './pages/ConsumerDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/restaurant" element={<RestaurantDashboard />} />
      <Route path="/consumer" element={<ConsumerDashboard />} />
    </Routes>
  );
}
