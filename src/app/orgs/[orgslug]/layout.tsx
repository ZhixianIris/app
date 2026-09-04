import React from 'react'
import { useParams } from 'react-router-dom'
import { OrgProvider } from '@components/Contexts/OrgContext'
import OrgLanguageSync from '@components/Contexts/OrgLanguageSync'
import Toast from '@components/Objects/StyledElements/Toast/Toast'
import '@styles/globals.css'
import Footer from '@components/Footer/Footer'
import CompleteSignupFields from '@components/Auth/CompleteSignupFields'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams() as { orgslug: string }
  const orgslug = params.orgslug ?? ''

  return (
    <div>
      <OrgProvider orgslug={orgslug}>
        <OrgLanguageSync />
        <Toast />
        <CompleteSignupFields />
        {children}
        <Footer />
      </OrgProvider>
    </div>
  )
}
