import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getAuthOrgSlug } from '@services/org/orgResolution'
import LoginClient from './login'
import OrgNotFound from '@components/Objects/StyledElements/Error/OrgNotFound'
const Login = async () => {
  const orgslug = await getAuthOrgSlug()

  // No org slug → bare apex (learn.io) → generic, org-less login.
  let org: any = null
  if (orgslug) {
    try {
      org = await getOrganizationContextInfo(orgslug, {
        revalidate: 60,
        tags: ['organizations'],
      })
    } catch {
      org = null
    }
    // A subdomain (or single-tenancy) slug that can't be resolved is a real error.
    if (!org) {
      return <OrgNotFound />
    }
  }

  return (
    <div>
      <LoginClient org={org}></LoginClient>
    </div>
  )
}

export default Login
