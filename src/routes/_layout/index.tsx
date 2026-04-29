import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Authenticated, Unauthenticated } from "convex/react";

export const Route = createFileRoute('/_layout/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight italic">
          CORE<span className="text-blue-600">APP</span>
        </h1>
        <p className="text-lg text-slate-600">
          A high-performance interface for account management and service synchronization.
        </p>

        <div className="pt-4">
          <Unauthenticated>
            <div className="flex flex-col gap-4">
              <Link
                to="/register"
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
              >
                Establish Node (Register)
              </Link>
              <Link
                to="/login"
                className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition border border-slate-200"
              >
                Access Terminal (Login)
              </Link>
            </div>
          </Unauthenticated>

          <Authenticated>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-slate-500 mb-6 font-medium">Node session established successfully.</p>
                <button
                onClick={() => navigate({ to: '/dashboard' })}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                >
                Enter Dashboard
                </button>
            </div>
          </Authenticated>
        </div>
      </div>
    </div>
  )
}
