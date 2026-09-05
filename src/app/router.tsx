import React, { Suspense, lazy } from 'react'
import {
  createBrowserRouter,
  isRouteErrorResponse,
  Navigate,
  Outlet,
  useLocation,
  useRouteError,
} from 'react-router-dom'

import NotFound from './not-found'
import { PostHogRouteObservers } from '@components/Contexts/PostHogProvider'
import ErrorBoundary from './error'
import PageLoading from '@components/Objects/Loaders/PageLoading'

/**
 * React Router route tree mirrored 1:1 from the original app-router file
 * layout. `page()` wraps a lazy route component in a Suspense boundary whose
 * fallback is the segment's original loading.tsx when one exists.
 */

type AnyComponent = React.ComponentType<any>
type LayoutComponent = React.ComponentType<any>

const page = (loader: () => Promise<{ default: AnyComponent }>, Fallback?: AnyComponent) => {
  const Component = lazy(loader)
  return (
    <Suspense fallback={Fallback ? <Suspense fallback={<PageLoading />}><Fallback /></Suspense> : <PageLoading />}>
      <Component />
    </Suspense>
  )
}

// Layouts take `children`; adapt them to React Router's <Outlet />.
function lazyLayout(loader: () => Promise<{ default: LayoutComponent }>) {
  const Layout = lazy(loader)
  return (
    <Suspense fallback={<PageLoading />}>
      <Layout>
        <Outlet />
      </Layout>
    </Suspense>
  )
}

function RouteErrorBoundary() {
  const error = useRouteError()
  const normalized = isRouteErrorResponse(error)
    ? new Error(`${error.status} ${error.statusText}`)
    : error instanceof Error
      ? error
      : new Error(String(error))
  return (
    <ErrorBoundary
      error={normalized}
      reset={() => window.location.reload()}
    />
  )
}

// ------- layouts (originally app-router layout.tsx files) -------
const withMenuLayout = lazyLayout(() => import('./orgs/[orgslug]/(withmenu)/layout'))
const orgLayout = lazyLayout(() => import('./orgs/[orgslug]/layout'))
const dashLayout = lazyLayout(() => import('./orgs/[orgslug]/dash/layout'))
const hubLayout = lazyLayout(() => import('./(hub)/layout'))
const authLayout = lazyLayout(() => import('./auth/layout'))
const adminLayout = lazyLayout(() => import('./admin/layout'))
const adminDashboardLayout = lazyLayout(() => import('./admin/(dashboard)/layout'))
const adminOrgLayout = lazyLayout(() => import('./admin/(dashboard)/organizations/[orgId]/layout'))
const embedLayout = lazyLayout(() => import('./embed/[orgslug]/layout'))

// loading fallbacks (originally per-segment loading.tsx)
const WithMenuLoading = lazy(() => import('./orgs/[orgslug]/(withmenu)/loading'))
const CourseLoading = lazy(() => import('./orgs/[orgslug]/(withmenu)/course/[courseuuid]/loading'))
const ActivityLoading = lazy(() => import('./orgs/[orgslug]/(withmenu)/course/[courseuuid]/activity/[activityid]/loading'))
const CoursesLoading = lazy(() => import('./orgs/[orgslug]/(withmenu)/courses/loading'))
const TrailLoading = lazy(() => import('./orgs/[orgslug]/(withmenu)/trail/loading'))
const BoardLoading = lazy(() => import('./board/[boarduuid]/loading'))
const EditorLoading = lazy(() => import('./editor/course/[courseid]/activity/[activityuuid]/edit/loading'))
const DashAnalyticsLoading = lazy(() => import('./orgs/[orgslug]/dash/analytics/loading'))
const DashCoursesLoading = lazy(() => import('./orgs/[orgslug]/dash/courses/loading'))
const DashCourseSubpageLoading = lazy(() => import('./orgs/[orgslug]/dash/courses/course/[courseuuid]/[subpage]/loading'))



// Auth redirect bridge — the login surfaces return here with ?next=<dest>
// instead of navigating cross-component, so the full page reload the session
// establishment needs happens in one hop.
function AuthNextBridge() {
  const next = new URLSearchParams(useLocation().search).get('next')
  const dest = next && /^\/(?!\/)/.test(next) ? next : '/home'
  return <Navigate to={dest} replace />
}

function RootLayout() {
  return (
    <>
      {/* Router-side analytics observers (no-ops without a PostHog key). */}
      <PostHogRouteObservers />
      <Outlet />
    </>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: page(() => import('./home/page')) },
      { path: 'home', element: page(() => import('./home/page')) },
      { path: 'redirect_from_auth', element: <AuthNextBridge /> },
      { path: 'payments/stripe/connect/oauth', element: page(() => import('./payments/stripe/connect/oauth/page')) },

      // ------- auth -------
      {
        path: 'auth',
        element: authLayout,
        children: [
          { path: 'login', element: page(() => import('./auth/login/page')) },
          { path: 'signup', element: page(() => import('./auth/signup/page')) },
          { path: 'forgot', element: page(() => import('./auth/forgot/page')) },
          { path: 'reset', element: page(() => import('./auth/reset/page')) },
          { path: 'magic', element: page(() => import('./auth/magic/page')) },
          { path: 'verify-email', element: page(() => import('./auth/verify-email/page')) },
          { path: 'token-exchange', element: page(() => import('./auth/token-exchange/page')) },
          { path: 'callback/google', element: page(() => import('./auth/callback/google/page')) },
          { path: 'sso/callback', element: page(() => import('./auth/sso/callback/page')) },
        ],
      },

      // ------- superadmin -------
      {
        path: 'admin',
        element: adminLayout,
        children: [
          { path: 'login', element: page(() => import('./admin/login/page')) },
          {
            path: '',
            element: adminDashboardLayout,
            children: [
              { index: true, element: page(() => import('./admin/(dashboard)/page')) },
              { path: 'analytics', element: page(() => import('./admin/(dashboard)/analytics/page')) },
              { path: 'developers', element: page(() => import('./admin/(dashboard)/developers/page')) },
              { path: 'organizations', element: page(() => import('./admin/(dashboard)/organizations/page')) },
              { path: 'users', element: page(() => import('./admin/(dashboard)/users/page')) },
              {
                path: 'organizations/:orgId',
                element: adminOrgLayout,
                children: [
                  { index: true, element: page(() => import('./admin/(dashboard)/organizations/[orgId]/page')) },
                ],
              },
            ],
          },
        ],
      },

      // ------- board & editor -------
      { path: 'board/:boarduuid', element: page(() => import('./board/[boarduuid]/page'), BoardLoading) },
      {
        path: 'editor/course/:courseid/activity/:activityuuid/edit',
        element: page(() => import('./editor/course/[courseid]/activity/[activityuuid]/edit/page'), EditorLoading),
      },
      { path: 'editor/playground/:playgrounduuid/edit', element: page(() => import('./editor/playground/[playgrounduuid]/edit/page')) },

      // ------- embeds -------
      {
        path: 'embed/:orgslug',
        element: embedLayout,
        children: [
          {
            path: 'course/:courseuuid/activity/:activityid',
            element: page(() => import('./embed/[orgslug]/course/[courseuuid]/activity/[activityid]/page')),
          },
        ],
      },

      // ------- org learner area -------
      {
        path: 'orgs/:orgslug',
        element: orgLayout,
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            path: '',
            element: withMenuLayout,
            errorElement: <RouteErrorBoundary />,
            children: [
              { index: true, element: page(() => import('./orgs/[orgslug]/(withmenu)/page'), WithMenuLoading) },
              { path: 'account', element: page(() => import('./orgs/[orgslug]/(withmenu)/account/page')) },
              { path: 'account/:subpage', element: page(() => import('./orgs/[orgslug]/(withmenu)/account/[subpage]/page')) },
              { path: 'boards', element: page(() => import('./orgs/[orgslug]/(withmenu)/boards/page')) },
              { path: 'certificates/:uuid/verify', element: page(() => import('./orgs/[orgslug]/(withmenu)/certificates/[uuid]/verify/page')) },
              { path: 'communities', element: page(() => import('./orgs/[orgslug]/(withmenu)/communities/page')) },
              { path: 'community/:communityuuid', element: page(() => import('./orgs/[orgslug]/(withmenu)/community/[communityuuid]/page')) },
              {
                path: 'community/:communityuuid/discussion/:discussionuuid',
                element: page(() => import('./orgs/[orgslug]/(withmenu)/community/[communityuuid]/discussion/[discussionuuid]/page')),
              },
              { path: 'copilot', element: page(() => import('./orgs/[orgslug]/(withmenu)/copilot/page')) },
              { path: 'course/:courseuuid', element: page(() => import('./orgs/[orgslug]/(withmenu)/course/[courseuuid]/page'), CourseLoading) },
              {
                path: 'course/:courseuuid/activity/:activityid',
                errorElement: <RouteErrorBoundary />,
                children: [
                  {
                    index: true,
                    element: page(
                      () => import('./orgs/[orgslug]/(withmenu)/course/[courseuuid]/activity/[activityid]/page'),
                      ActivityLoading
                    ),
                  },
                ],
              },
              { path: 'courses', element: page(() => import('./orgs/[orgslug]/(withmenu)/courses/page'), CoursesLoading) },
              { path: 'library', element: page(() => import('./orgs/[orgslug]/(withmenu)/library/page')) },
              { path: 'library/folder/:folderid', element: page(() => import('./orgs/[orgslug]/(withmenu)/library/folder/[folderid]/page')) },
              { path: 'playground/:playgrounduuid', element: page(() => import('./orgs/[orgslug]/(withmenu)/playground/[playgrounduuid]/page')) },
              { path: 'playgrounds', element: page(() => import('./orgs/[orgslug]/(withmenu)/playgrounds/page')) },
              { path: 'podcast/:podcastuuid', element: page(() => import('./orgs/[orgslug]/(withmenu)/podcast/[podcastuuid]/page')) },
              { path: 'podcasts', element: page(() => import('./orgs/[orgslug]/(withmenu)/podcasts/page')) },
              { path: 'search', element: page(() => import('./orgs/[orgslug]/(withmenu)/search/page')) },
              { path: 'store', element: page(() => import('./orgs/[orgslug]/(withmenu)/store/page')) },
              { path: 'store/offers/:offerid', element: page(() => import('./orgs/[orgslug]/(withmenu)/store/offers/[offerid]/page')) },
              { path: 'trail', element: page(() => import('./orgs/[orgslug]/(withmenu)/trail/page'), TrailLoading) },
              { path: 'user/:username', element: page(() => import('./orgs/[orgslug]/(withmenu)/user/[username]/page')) },
            ],
          },
          {
            path: 'dash',
            element: dashLayout,
            errorElement: <RouteErrorBoundary />,
            children: [
              { index: true, element: page(() => import('./orgs/[orgslug]/dash/page')) },
              { path: 'analytics', element: page(() => import('./orgs/[orgslug]/dash/analytics/page'), DashAnalyticsLoading) },
              { path: 'assignments', element: page(() => import('./orgs/[orgslug]/dash/assignments/page')) },
              { path: 'assignments/:assignmentuuid', element: page(() => import('./orgs/[orgslug]/dash/assignments/[assignmentuuid]/page')) },
              { path: 'boards', element: page(() => import('./orgs/[orgslug]/dash/boards/page')) },
              { path: 'boards/:boarduuid', element: page(() => import('./orgs/[orgslug]/dash/boards/[boarduuid]/page')) },
              { path: 'boards/:boarduuid/:subpage', element: page(() => import('./orgs/[orgslug]/dash/boards/[boarduuid]/[subpage]/page')) },
              { path: 'communities', element: page(() => import('./orgs/[orgslug]/dash/communities/page')) },
              { path: 'communities/:communityuuid', element: page(() => import('./orgs/[orgslug]/dash/communities/[communityuuid]/page')) },
              { path: 'communities/:communityuuid/:subpage', element: page(() => import('./orgs/[orgslug]/dash/communities/[communityuuid]/[subpage]/page')) },
              {
                path: 'courses',
                errorElement: <RouteErrorBoundary />,
                children: [
                  { index: true, element: page(() => import('./orgs/[orgslug]/dash/courses/page'), DashCoursesLoading) },
                  {
                    path: 'course/:courseuuid/:subpage',
                    errorElement: <RouteErrorBoundary />,
                    children: [
                      {
                        index: true,
                        element: page(
                          () => import('./orgs/[orgslug]/dash/courses/course/[courseuuid]/[subpage]/page'),
                          DashCourseSubpageLoading
                        ),
                      },
                    ],
                  },
                  { path: 'migrate', element: page(() => import('./orgs/[orgslug]/dash/courses/migrate/page')) },
                ],
              },
              { path: 'developers', element: page(() => import('./orgs/[orgslug]/dash/developers/page')) },
              { path: 'developers/:subpage', element: page(() => import('./orgs/[orgslug]/dash/developers/[subpage]/page')) },
              { path: 'library', element: page(() => import('./orgs/[orgslug]/dash/library/page')) },
              { path: 'library/folder/:folderid', element: page(() => import('./orgs/[orgslug]/dash/library/folder/[folderid]/page')) },
              { path: 'onboarding', element: page(() => import('./orgs/[orgslug]/dash/onboarding/page')) },
              { path: 'org/settings/:subpage', element: page(() => import('./orgs/[orgslug]/dash/org/settings/[subpage]/page')) },
              { path: 'payments/:subpage', element: page(() => import('./orgs/[orgslug]/dash/payments/[subpage]/page')) },
              { path: 'playgrounds', element: page(() => import('./orgs/[orgslug]/dash/playgrounds/page')) },
              { path: 'podcasts', element: page(() => import('./orgs/[orgslug]/dash/podcasts/page')) },
              { path: 'podcasts/podcast/:podcastuuid/:subpage', element: page(() => import('./orgs/[orgslug]/dash/podcasts/podcast/[podcastuuid]/[subpage]/page')) },
              { path: 'users/analytics/:userId', element: page(() => import('./orgs/[orgslug]/dash/users/analytics/[userId]/page')) },
              { path: 'users/settings/:subpage', element: page(() => import('./orgs/[orgslug]/dash/users/settings/[subpage]/page')) },
            ],
          },
        ],
      },

      // ------- hub (account / billing / org creation) -------
      {
        path: '',
        element: hubLayout,
        errorElement: <RouteErrorBoundary />,
        children: [
          { path: 'account', element: page(() => import('./(hub)/account/page')) },
          { path: 'billing', element: page(() => import('./(hub)/billing/page')) },
          { path: 'new', element: page(() => import('./(hub)/new/page')) },
          { path: 'organizations', element: page(() => import('./(hub)/organizations/page')) },
          { path: 'subscriptions', element: page(() => import('./(hub)/subscriptions/page')) },
        ],
      },

      { path: '*', element: <NotFound /> },
    ],
  },
])

export default router
