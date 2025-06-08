'use client';

import { useEffect, useState } from 'react';
import WatchCard from '../../components/WatchCard';
import { Watch } from '../../lib/types';
import { getWatches } from '../../services/watchService';

const ShopPage = () => {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatches = async () => {
      try {
        const watchesData = await getWatches();
        setWatches(watchesData);
      } catch (err) {
        setError('Failed to fetch watches.');
        console.error('Error fetching watches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatches();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading watches...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Shop</h1>
      {watches.length === 0 ? (
        <p className="text-center">No watches available in the shop.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {watches.map((watch) => (
            <WatchCard key={watch.id} watch={watch} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopPage;