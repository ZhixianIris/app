import React, { Suspense, useEffect, useState } from 'react'
import { useAppSession } from '@components/Contexts/AppSessionContext'
import { Check, Loader2, AlertTriangle } from 'lucide-react'
import { motion } from 'motion/react'
import toast from 'react-hot-toast'
import { verifyStripeConnection } from '@services/payments/providers/stripe'
import { useAppAnalytics, AnalyticsEvent } from '@services/analytics'
const learningWebIcon = '/app_bigicon_1.png'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from "react-router-dom";

function StripeConnectCallbackInner() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const session = useAppSession() as any
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('')
  const { track } = useAppAnalytics('dashboard')

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const orgId = state?.split('=')[1]

        if (!code || !orgId) {
          throw new Error('Missing required parameters')
        }

        await verifyStripeConnection(
          parseInt(orgId),
          code,
          session?.data?.tokens?.access_token
        )

        await new Promise(resolve => setTimeout(resolve, 1000))

        track(AnalyticsEvent.PaymentProviderConnected, { provider: 'stripe' })

        setStatus('success')
        setMessage(t('payments.stripe_success'))

        if (window.opener) {
          window.opener.postMessage({ type: 'payment_provider_connected', provider: 'stripe' }, '*')
        }

        setTimeout(() => {
          window.close()
        }, 2000)

      } catch (error) {
        console.error('Error verifying Stripe connection:', error)
        setStatus('error')
        setMessage(t('payments.stripe_failed'))
        toast.error(t('payments.stripe_failed'))
      }
    }

    if (session) {
      verifyConnection()
    }
  }, [session, navigate, searchParams])

  return (
    <div className="h-screen w-full bg-[#f8f8f8] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="mb-10">
          <img
            width={50}
            height={50}
            src={learningWebIcon}
            alt="" 
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-8 rounded-xl nice-shadow max-w-md w-full mx-4"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            {status === 'processing' && (
              <>
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                <h2 className="text-xl font-semibold text-gray-800">
                  {t('payments.stripe_completing')}
                </h2>
                <p className="text-gray-500">
                  {t('payments.stripe_wait')}
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="bg-green-100 p-3 rounded-full">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
                <p className="text-gray-500">
                  {t('payments.stripe_return')}
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
                <p className="text-gray-500">
                  {t('payments.stripe_retry')}
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function StripeConnectCallback() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-[#f8f8f8] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    }>
      <StripeConnectCallbackInner />
    </Suspense>
  )
}
