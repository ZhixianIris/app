import React from 'react'

// Fonts — originally loaded via next/font/google in the app-router root
// layout, now self-hosted through Fontsource. The CSS custom properties
// (--font-default, --font-arabic) are consumed by styles/globals.css.
import '@fontsource/wix-madefor-text/400.css'
import '@fontsource/wix-madefor-text/500.css'
import '@fontsource/wix-madefor-text/600.css'
import '@fontsource/wix-madefor-text/700.css'
import '@fontsource/wix-madefor-text/800.css'
import '@fontsource/tajawal/300.css'
import '@fontsource/tajawal/400.css'
import '@fontsource/tajawal/500.css'
import '@fontsource/tajawal/700.css'
import '@fontsource/tajawal/800.css'

import '@styles/globals.css'

import Providers from '@components/Providers'

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
