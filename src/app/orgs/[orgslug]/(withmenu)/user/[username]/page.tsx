import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { getUserByUsername } from '@services/users/users'
import { useAppSession } from '@components/Contexts/AppSessionContext'
import UserProfileClient from './UserProfileClient'
import PageLoading from '@components/Objects/Loaders/PageLoading'

const UserPage = () => {
  const { username } = useParams() as { username: string }
  const session = useAppSession() as any
  const access_token = session?.data?.tokens?.access_token

  const [userData, setUserData] = useState<any>(null)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!access_token || !username) return
      try {
        // Fetch user data by username with authentication
        const data = await getUserByUsername(username, access_token)
        if (!cancelled) {
          setUserData(data)
          setLoaded(true)
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        if (!cancelled) {
          setError(true)
          setLoaded(true)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [username, access_token])

  if (session?.status === 'loading') {
    return <PageLoading />
  }

  // Require authentication to view user profiles.
  if (!access_token) {
    return <Navigate to={`/login?redirect=/user/${username}`} replace />
  }

  if (!loaded) {
    return <PageLoading />
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-white rounded-xl nice-shadow p-6">
          <p className="text-red-600">Error loading user profile. The user may not exist or you may not have permission to view this profile.</p>
        </div>
      </div>
    )
  }

  const profile = userData?.profile ? (
    typeof userData.profile === 'string' ? JSON.parse(userData.profile) : userData.profile
  ) : { sections: [] }

  return (
    <div>
      <UserProfileClient
        userData={userData}
        profile={profile}
      />
    </div>
  )
}

export default UserPage
