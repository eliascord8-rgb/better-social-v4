import {
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Outlet />
    </div>
  )
}
