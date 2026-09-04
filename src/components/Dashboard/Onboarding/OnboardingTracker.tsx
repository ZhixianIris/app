import { useEffect } from 'react'
import { useOnboarding, ONBOARDING_STEP_DEFS } from '@components/Hooks/useOnboarding'
import { useLocation } from "react-router-dom";

/**
 * Headless tracker that auto-completes onboarding steps as the user navigates
 * the dashboard. Mounted app-wide (in place of the old floating OnboardingBar)
 * so step progress keeps advancing while the bar itself is gone. Completion
 * rules are sourced from the step defs' `completePath` regexes.
 */
export default function OnboardingTracker() {
  const { completeStep } = useOnboarding()
  const pathname = useLocation().pathname

  useEffect(() => {
    if (!pathname) return
    for (const def of ONBOARDING_STEP_DEFS) {
      if (def.completePath && new RegExp(def.completePath).test(pathname)) {
        completeStep(def.id)
      }
    }
  }, [pathname, completeStep])

  return null
}
