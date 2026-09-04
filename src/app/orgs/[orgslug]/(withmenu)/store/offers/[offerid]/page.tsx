import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getPublicOffer } from '@services/payments/offers'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import OfferDetailClient from './offer-detail'
import PageLoading from '@components/Objects/Loaders/PageLoading'

export default function OfferPage() {
  const { orgslug, offerid } = useParams() as { orgslug: string; offerid: string }
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token ?? null

  const [org, setOrg] = useState<any>(null)
  const [offer, setOffer] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!orgslug || !offerid) return
      let nextOrg: any = null
      try {
        nextOrg = await getOrganizationContextInfo(orgslug, { revalidate: 120, tags: ['organizations'] })
      } catch (error) {
        console.error('Error fetching organization:', error)
      }
      let nextOffer: any = null
      if (nextOrg?.id) {
        try {
          const result = await getPublicOffer(nextOrg.id, offerid)
          nextOffer = result?.data ?? result
        } catch {}
      }
      if (cancelled) return
      setOrg(nextOrg)
      setOffer(nextOffer)
      setLoaded(true)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [orgslug, offerid, access_token])

  if (!loaded || !org) {
    return <PageLoading />
  }

  return (
    <OfferDetailClient
      orgslug={orgslug ?? ''}
      orgId={org.id}
      offer={offer}
      offerUuid={offerid ?? ''}
      access_token={access_token}
    />
  )
}
