'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { UploadModeContext } from './media';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { ToastProvider } from './ToastProvider';

export function AdminShell({
  email,
  logoUrl,
  siteName,
  logoutAction,
  uploadMode,
  children,
}: {
  email: string;
  logoUrl?: string;
  siteName?: string;
  logoutAction: () => void;
  uploadMode: 'uploadthing' | 'local';
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <UploadModeContext.Provider value={uploadMode}>
      <ToastProvider>
        <div className="min-h-screen bg-background">
          <AdminSidebar open={open} onClose={() => setOpen(false)} logoUrl={logoUrl} siteName={siteName} />
          <AdminHeader email={email} onMenu={() => setOpen(true)} logoutAction={logoutAction} />
          <main className="pt-[72px] lg:pl-[272px]">
            <div className="p-5 sm:p-8 lg:p-10">{children}</div>
          </main>
        </div>
      </ToastProvider>
    </UploadModeContext.Provider>
  );
}
