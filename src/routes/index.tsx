import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
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

  return <div className="min-h-screen bg-[#030712]"></div>;
}
