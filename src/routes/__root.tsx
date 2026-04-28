import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useNavigate,
} from '@tanstack/react-router'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'
import { LiveChatWidget } from '../components/LiveChatWidget'
import { Authenticated, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useI18n } from '../lib/i18n'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      {
        title: 'Better Social',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  notFoundComponent: () => <div>Route not found</div>,
  component: RootComponent,
})

function MaintenanceMode() {
    const { t } = useI18n();
    return (
        <div className="fixed inset-0 bg-[#080c16] z-[9999] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse"></div>
            </div>
            <div className="relative z-10 max-w-2xl space-y-8 animate-in fade-in zoom-in duration-1000">
                <div className="w-24 h-24 bg-blue-600/20 border border-blue-500/30 rounded-[2rem] flex items-center justify-center text-5xl mx-auto shadow-[0_0_50px_rgba(37,99,235,0.3)] rotate-12">🛠️</div>
                <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none">
                    {t('maintenance_title')}
                </h1>
                <p className="text-slate-400 text-lg md:text-xl font-medium uppercase tracking-tight italic max-w-xl mx-auto leading-relaxed">
                    "{t('maintenance_desc')}"
                </p>
                <div className="flex justify-center space-x-3">
                    {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 200}ms` }}></div>)}
                </div>
            </div>
            <LiveChatWidget />
        </div>
    );
}

function GlobalSessionManager() {
    const user = useQuery(api.users.currentUser, {});
    const syncSession = useMutation(api.users.syncSession);
    const { signOut } = useAuthActions();
    const navigate = useNavigate();
    const clearAlert = useMutation(api.admin.clearDirectAlert);
    const [localSessionId, setLocalSessionId] = React.useState<string | null>(() => {
        if (typeof window !== "undefined") return sessionStorage.getItem("bs_session_id");
        return null;
    });

    const [lastActivity, setLastActivity] = React.useState(Date.now());

    React.useEffect(() => {
        const handleActivity = () => setLastActivity(Date.now());
        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("keydown", handleActivity);
        window.addEventListener("click", handleActivity);
        window.addEventListener("scroll", handleActivity);
        return () => {
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("keydown", handleActivity);
            window.removeEventListener("click", handleActivity);
            window.removeEventListener("scroll", handleActivity);
        };
    }, []);

    React.useEffect(() => {
        if (user) {
            // Inactivity check (30 minutes)
            const checkInactivity = setInterval(() => {
                const now = Date.now();
                if (now - lastActivity > 30 * 60 * 1000) {
                    sessionStorage.removeItem("bs_session_id");
                    void signOut();
                    alert("INACTIVITY TIMEOUT: Identity node standby protocol engaged. Please re-authenticate.");
                    navigate({ to: '/login' });
                }
            }, 10000);

            if (!user.sessionId) {
                // If user has no session ID in DB, create one and sync
                const newSid = Math.random().toString(36).substring(7);
                void syncSession({ sessionId: newSid });
                setLocalSessionId(newSid);
                sessionStorage.setItem("bs_session_id", newSid);
            } else if (!localSessionId) {
                // If we have no local SID but DB has one, adopt it (happens on refresh)
                setLocalSessionId(user.sessionId);
                sessionStorage.setItem("bs_session_id", user.sessionId);
            } else if (user.sessionId !== localSessionId) {
                // Kicked logic (DB SID changed and doesn't match local)
                sessionStorage.removeItem("bs_session_id");
                void signOut();
                alert("IDENTITY NODE TERMINATED: Session conflict detected or administrator override.");
                navigate({ to: '/' });
            }

            if (user.directAlert) {
                alert(`SYSTEM TRANSMISSION: ${user.directAlert}`);
                void clearAlert();
            }

            return () => clearInterval(checkInactivity);
        }
    }, [user, localSessionId, signOut, navigate, clearAlert, syncSession, lastActivity]);

    return null;
}

function RootComponent() {
  const isMaintenance = useQuery(api.admin.getMaintenanceMode, {});
  const user = useQuery(api.users.currentUser, {});

  if (isMaintenance && !user?.isAdmin) {
      return (
          <RootDocument>
              <MaintenanceMode />
          </RootDocument>
      );
  }

  return (
    <RootDocument>
      <Authenticated>
        <GlobalSessionManager />
      </Authenticated>
      <Outlet />
      <LiveChatWidget />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
