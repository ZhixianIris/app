import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getPublicOffers } from '@services/payments/offers'
import Store from './store'
import PageLoading from '@components/Objects/Loaders/PageLoading'

export default function StorePage() {
  const { orgslug } = useParams() as { orgslug: string }

  const [org, setOrg] = useState<any>(null)
  const [offers, setOffers] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!orgslug) return
      let nextOrg: any = null
      try {
        nextOrg = await getOrganizationContextInfo(orgslug, { revalidate: 120, tags: ['organizations'] })
      } catch (error) {
        console.error('Error fetching organization:', error)
      }
      let nextOffers: any[] = []
      if (nextOrg?.id) {
        try {
          const result = await getPublicOffers(nextOrg.id)
          nextOffers = result?.success && Array.isArray(result.data) ? result.data : []
        } catch {
          nextOffers = []
        }
      }
      if (cancelled) return
      setOrg(nextOrg)
      setOffers(nextOffers)
      setLoaded(true)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [orgslug])

  const paymentsEnabled = org?.config?.config?.resolved_features?.payments?.enabled ?? org?.config?.config?.features?.payments?.enabled !== false

  if (!loaded) {
    return <PageLoading />
  }

  if (!paymentsEnabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-4 nice-shadow">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-600 mb-2">Store not available</h2>
        <p className="text-gray-400 text-sm max-w-sm">
          This organization has not enabled their store yet.
        </p>
      </div>
    )
  }

  return (
    <Store orgslug={orgslug ?? ''} offers={offers} />
  )
}
