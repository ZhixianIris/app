import React from 'react'
import OrgScripts from '@/components/OrgScripts/OrgScripts'
import { useLocation } from "react-router-dom";

const Footer: React.FC = () => {
  const pathname = useLocation().pathname
  // App/dashboard pages live under `/dash` on .io (org subdomains) — the old
  // `/dashboard` prefix never matches here. Match both to be safe.
  const isDashboard = /(?:^|\/)dash(?:board)?(?:\/|$)/.test(pathname || '')

  // Don't run scripts in dashboard pages
  if (isDashboard) {
    return null
  }

  return <OrgScripts />
}

export default Footer 