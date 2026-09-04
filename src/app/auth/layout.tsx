import { useEffect, useState, type ReactNode } from 'react'
import { OrgProvider } from '@components/Contexts/OrgContext'
import OrgLanguageSync from '@components/Contexts/OrgLanguageSync'

function getAuthOrgSlug(): string | null {
  try {
    const match = document.cookie.match(/(?:^|; )app_org=([^;]*)/)
    return match ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

export default function AuthLayout({
    children,
}: {
    children: ReactNode
}) {
    const [orgslug, setOrgslug] = useState<string | null | undefined>(undefined)

    useEffect(() => {
      setOrgslug(getAuthOrgSlug())
    }, [])

    if (orgslug === undefined) {
      return <>{children}</>
    }

    // No org slug → bare apex → generic, org-less auth pages. No OrgProvider;
    // the page renders generic branding.
    if (!orgslug) {
        return <>{children}</>
    }

    return (
        <OrgProvider orgslug={orgslug}>
            <OrgLanguageSync />
            {children}
        </OrgProvider>
    )
}
