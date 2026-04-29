import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: RootIndex,
})

function RootIndex() {
  const navigate = useNavigate();
  const user = useQuery(api.users.currentUser, {});

  useEffect(() => {
    if (user === null) {
      navigate({ to: '/login' });
    } else if (user) {
      navigate({ to: '/dashboard' });
    }
  }, [user, navigate]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#030712]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black animate-pulse shadow-2xl shadow-blue-600/50">BS</div>
        <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic animate-pulse">Establishing Node Connection...</div>
      </div>
    </div>
  );
}
