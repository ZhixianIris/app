import React, { type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { OrgProvider } from '@components/Contexts/OrgContext'
import OrgLanguageSync from '@components/Contexts/OrgLanguageSync'
import '@styles/globals.css'

export default function EmbedLayout({
  children,
}: {
  children: ReactNode
}) {
  const params = useParams() as { orgslug: string }

  return (
    <OrgProvider orgslug={params.orgslug ?? ''}>
      <OrgLanguageSync />
      {/* Suppress the root layout fade-in animation for embeds */}
      {/* Force light color scheme — prevents browsers in OS dark mode from auto-inverting text colors */}
      <style>{`.animate-fade-in{animation:none!important;opacity:1!important}:root{color-scheme:light}html,body{color:#09090b}`}</style>
      <div className="min-h-screen">
        {children}
      </div>
    </OrgProvider>
  )
}
