/**
 * learning-web-analytics — the single import surface for product analytics.
 *
 *   import { useAppAnalytics, AnalyticsEvent } from '@services/analytics'
 *   const { track } = useAppAnalytics('learner')
 *   track(AnalyticsEvent.CourseStarted, { course_uuid })
 */
export { AnalyticsEvent } from './events'
export { useAppAnalytics, type EventProps } from './useAppAnalytics'
export { useTrackView } from './useTrackView'
export { useStandardProps, type StandardProps } from './context'
