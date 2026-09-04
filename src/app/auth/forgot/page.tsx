import { getOrganizationContextInfo } from '@services/organizations/orgs'
import { getAuthOrgSlug } from '@services/org/orgResolution'
import ForgotPasswordClient from './forgot'
import OrgNotFound from '@components/Objects/StyledElements/Error/OrgNotFound'
const ForgotPasswordPage = async () => {
  const orgslug = await getAuthOrgSlug()

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
    if (!org) {
      return <OrgNotFound />
    }
  }
  // Org-less apex: `org` stays null (unbranded). Password reset is platform-level
  // (by email), so no org is needed for the reset call.

  return <ForgotPasswordClient org={org} />
}

export default ForgotPasswordPage
