import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import AppProviders from './app/providers'
import { router } from './app/router'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <main className="animate-fade-in">
        <RouterProvider router={router} />
      </main>
    </AppProviders>
  </React.StrictMode>,
)
