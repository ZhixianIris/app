import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import {
  BookOpen,
  User as UserIcon,
  ChatsCircle,
  ChatCircle,
  Cube,
  Microphone,
} from '@phosphor-icons/react'

import { useCommandPalette } from './CommandPaletteContext'
import { dashboardPages } from '@/lib/dashboard-search/registry'
import type { SearchMeta } from '@/lib/dashboard-search/types'
import {
  useContentSearch,
  type ContentResult,
  type ContentResultType,
} from '@/lib/dashboard-search/useContentSearch'
import { useOrgMembership } from '@components/Contexts/OrgContext'
import { isFeatureAvailable } from '@services/plans/plans'
import { normalizeForSearch } from '@/lib/search/normalize'
import { useAppAnalytics, AnalyticsEvent } from '@services/analytics'
import { useNavigate } from "react-router-dom";

const CONTENT_TYPE_ICON: Record<ContentResultType, SearchMeta['icon']> = {
  course: BookOpen,
  user: UserIcon,
  community: ChatsCircle,
  discussion: ChatCircle,
  playground: Cube,
  podcast: Microphone,
}

const CONTENT_TYPE_GROUP_KEY: Record<ContentResultType, string> = {
  course: 'dashboard.search.groups.courses',
  user: 'dashboard.search.groups.users',
  community: 'dashboard.search.groups.communities',
  discussion: 'dashboard.search.groups.discussions',
  playground: 'dashboard.search.groups.playgrounds',
  podcast: 'dashboard.search.groups.podcasts',
}

const CONTENT_TYPE_ORDER: ContentResultType[] = [
  'course',
  'user',
  'community',
  'discussion',
  'playground',
  'podcast',
]

function usePagesFiltered(): SearchMeta[] {
  const { org } = useOrgMembership()
  const resolvedFeatures = org?.config?.config?.resolved_features
  return useMemo(
    () =>
      dashboardPages.filter((p) => {
        if (!p.featureKey) return true
        const rf = resolvedFeatures?.[p.featureKey]
        if (rf) return rf.enabled
        return isFeatureAvailable(p.featureKey)
      }),
    [resolvedFeatures],
  )
}

function groupContentResults(results: ContentResult[]): Record<ContentResultType, ContentResult[]> {
  const groups: Record<ContentResultType, ContentResult[]> = {
    course: [],
    user: [],
    community: [],
    discussion: [],
    playground: [],
    podcast: [],
  }
  for (const r of results) groups[r.type].push(r)
  return groups
}

export default function CommandPalette() {
  const { t } = useTranslation()
  const { open, setOpen } = useCommandPalette()
  const navigate = useNavigate()
  const { track } = useAppAnalytics('dashboard')
  const [query, setQuery] = useState('')

  const pages = usePagesFiltered()
  const { results, isLoading, isWaiting } = useContentSearch(query)
  const grouped = useMemo(() => groupContentResults(results), [results])
  const [activeIndex, setActiveIndex] = useState(0)

  // Mirror of cmdk's scorer: same token/substring semantics over the item's
  // search text. 0 hides the item; higher ranks first.
  const matchScore = useCallback((value: string, search: string): number => {
    const haystack = normalizeForSearch(value)
    const needle = normalizeForSearch(search)
    if (!needle) return 1
    if (haystack.includes(needle)) return 1
    const tokens = needle.split(/\s+/u).filter(Boolean)
    if (tokens.length === 0) return 1
    return tokens.every((tok: string) => haystack.includes(tok)) ? 0.8 : 0
  }, [])

  const filteredPages = useMemo(() => {
    if (!query.trim()) return pages.map((p, index) => ({ item: p, index, score: 1 }))
    return pages
      .map((p, index) => {
        const title = t(p.titleKey)
        const description = p.descriptionKey ? t(p.descriptionKey) : undefined
        const keywords = p.keywordsKey ? t(p.keywordsKey) : ''
        return { item: p, index, score: matchScore(`${title} ${description ?? ''} ${keywords}`, query) }
      })
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score)
  }, [pages, query, t, matchScore])

  const filteredContentGroups = useMemo(() => {
    return CONTENT_TYPE_ORDER.map((type) => {
      const items = grouped[type]
      if (!query.trim()) return { type, entries: items.map((r, index) => ({ item: r, index, score: 1 })) }
      return {
        type,
        entries: items
          .map((r, index) => ({ item: r, index, score: matchScore(`${r.title} ${r.subtitle ?? ''}`, query) }))
          .filter((e) => e.score > 0)
          .sort((a, b) => b.score - a.score),
      }
    }).filter((g) => g.entries.length > 0)
  }, [grouped, query, matchScore])

  const contentGroupHeading = (type: ContentResultType) => t(CONTENT_TYPE_GROUP_KEY[type])

  // Reset state when palette closes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  // Fire an open impression each time the palette opens.
  useEffect(() => {
    if (open) track(AnalyticsEvent.CommandPaletteOpened)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSelect = (href: string, resultType: string, resultIndex: number) => {
    track(AnalyticsEvent.CommandPaletteResultSelected, {
      result_type: resultType,
      result_index: resultIndex,
    })
    setOpen(false)
    navigate(href)
  }

  const openSelectedInNewTab = (rootEl: HTMLElement | null) => {
    const selected = rootEl?.querySelector(
      '[data-command-item][aria-selected="true"]',
    ) as HTMLElement | null
    const href = selected?.getAttribute('data-href')
    if (!href) return
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  const renderPageItem = (p: SearchMeta, index: number, selected: boolean) => {
    const title = t(p.titleKey)
    const description = p.descriptionKey ? t(p.descriptionKey) : undefined
    const Icon = p.icon
    return (
      <div
        key={p.id}
        role="option"
        aria-selected={selected}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => onSelect(p.href, 'page', index)}
        className="group/item flex cursor-pointer items-center gap-3.5 rounded-lg px-3 py-2.5 text-white/70 transition-colors aria-selected:bg-white/[0.06] aria-selected:text-white"
        data-command-item
        data-href={p.href}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-white/60 group-aria-selected/item:bg-white/[0.08] group-aria-selected/item:text-white">
          <Icon size={15} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-snug">
          <span className="truncate text-[14px] font-medium text-white/90 group-aria-selected/item:text-white">
            {title}
          </span>
          {description ? (
            <span className="truncate text-[12.5px] text-white/40">{description}</span>
          ) : null}
        </span>
        <span className="hidden text-white/40 group-aria-selected/item:inline">↵</span>
      </div>
    )
  }

  const renderContentItem = (r: ContentResult, index: number, selected: boolean) => {
    const Icon = CONTENT_TYPE_ICON[r.type]
    return (
      <div
        key={`${r.type}-${r.id}`}
        role="option"
        aria-selected={selected}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => onSelect(r.href, r.type, index)}
        className="group/item flex cursor-pointer items-center gap-3.5 rounded-lg px-3 py-2.5 text-white/70 transition-colors aria-selected:bg-white/[0.06] aria-selected:text-white"
        data-command-item
        data-href={r.href}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-white/60 group-aria-selected/item:bg-white/[0.08] group-aria-selected/item:text-white">
          <Icon size={15} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-snug">
          <span className="truncate text-[14px] font-medium text-white/90 group-aria-selected/item:text-white">
            {r.title}
          </span>
          {r.subtitle ? (
            <span className="truncate text-[12.5px] text-white/40">{r.subtitle}</span>
          ) : null}
        </span>
        <span className="hidden text-white/40 group-aria-selected/item:inline">↵</span>
      </div>
    )
  }

  // Flat, keyboard-navigable model of the rendered entries. The index order
  // must match the rendered order: pages first, then content groups in order.
  type FlatEntry = { run: () => void }
  const flatItems: FlatEntry[] = useMemo(() => {
    const items: FlatEntry[] = []
    filteredPages.forEach((entry, position) => {
      items.push({ run: () => onSelect(entry.item.href, 'page', entry.index) })
      void position
    })
    filteredContentGroups.forEach((group) => {
      group.entries.forEach((entry) => {
        items.push({ run: () => onSelect(entry.item.href, group.type, entry.index) })
      })
    })
    return items
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPages, filteredContentGroups])

  const searchInputRef = React.useRef<HTMLInputElement>(null)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 bg-black/40 transition-opacity duration-100 ease-out data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
          style={{ zIndex: 'var(--z-modal-backdrop)' as unknown as string }}
        />
        <DialogPrimitive.Viewport
          className="fixed inset-0"
          style={{ zIndex: 'var(--z-modal)' as unknown as string }}
        >
        <DialogPrimitive.Popup
          aria-label={t('dashboard.search.placeholder')}
          initialFocus={searchInputRef}
          className="fixed left-1/2 top-[10%] flex w-[94vw] max-w-[760px] -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-black/85 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-2xl backdrop-saturate-150 transition-[opacity,transform] duration-150 ease-out data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:-translate-y-2 data-[ending-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:-translate-y-2"
        >
          {/* Top rim highlight + soft top glow */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/[0.06] via-white/[0.015] to-transparent"
          />
          <DialogPrimitive.Title className="sr-only">
            {t('dashboard.search.placeholder')}
          </DialogPrimitive.Title>

          <div
            role="combobox"
            aria-expanded="true"
            aria-label={t('dashboard.search.placeholder')}
            className="flex flex-col [&_[data-command-group-heading]]:px-3 [&_[data-command-group-heading]]:pt-3 [&_[data-command-group-heading]]:pb-1.5 [&_[data-command-group-heading]]:text-[10.5px] [&_[data-command-group-heading]]:font-semibold [&_[data-command-group-heading]]:uppercase [&_[data-command-group-heading]]:tracking-[0.08em] [&_[data-command-group-heading]]:text-white/35"
          >
            {/* Header */}
            <div className="flex items-start gap-4 px-4 sm:px-7 pt-5 sm:pt-6 pb-4 sm:pb-5">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-white/45">
                    {t('dashboard.search.trigger')}
                  </span>
                  {(isLoading || isWaiting) && (
                    <span className="text-[11px] text-white/35">
                      · {t('dashboard.search.loading')}
                    </span>
                  )}
                </div>
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('dashboard.search.placeholder')}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault()
                      e.stopPropagation()
                      const root = (e.currentTarget as HTMLElement).closest(
                        '[role="combobox"]',
                      ) as HTMLElement | null
                      openSelectedInNewTab(root)
                      return
                    }
                    if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      setActiveIndex((i) => (flatItems.length ? (i + 1) % flatItems.length : 0))
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      setActiveIndex((i) => (flatItems.length ? (i - 1 + flatItems.length) % flatItems.length : 0))
                    } else if (e.key === 'Enter') {
                      e.preventDefault()
                      const active = flatItems[activeIndex]
                      if (active) active.run()
                    }
                  }}
                  type="text"
                  role="textbox"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="w-full bg-transparent text-[18px] sm:text-[22px] font-medium leading-tight tracking-tight text-white outline-none placeholder:font-medium placeholder:text-white/35"
                />
              </div>
              <img
                src="/lrn-dash.svg"
                alt=""
                aria-hidden="true"
                draggable={false}
                className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 select-none opacity-90"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-white/[0.06]" />

            {/* List */}
            <div
              role="listbox"
              aria-label={t('dashboard.search.placeholder')}
              className="min-h-[260px] max-h-[55vh] overflow-y-auto px-2 pt-1 pb-2 scroll-py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
              style={{ scrollbarColor: 'rgba(255,255,255,0.15) transparent', scrollbarWidth: 'thin' }}
            >
              {flatItems.length === 0 && (
                <div className="px-4 py-14 text-center text-sm text-white/45">
                  {isLoading || isWaiting
                    ? t('dashboard.search.loading')
                    : t('dashboard.search.no_results')}
                </div>
              )}

              {filteredPages.length > 0 && (
                <div>
                  <div data-command-group-heading>{t('dashboard.search.groups.pages')}</div>
                  {filteredPages.map((entry, position) =>
                    renderPageItem(entry.item, entry.index, activeIndex === position),
                  )}
                </div>
              )}

              {filteredContentGroups.map((group) => (
                <div key={group.type}>
                  <div data-command-group-heading>{contentGroupHeading(group.type)}</div>
                  {group.entries.map((entry, position) =>
                    renderContentItem(
                      entry.item,
                      entry.index,
                      activeIndex === filteredPages.length + position,
                    ),
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 sm:gap-5 border-t border-white/[0.06] bg-black/20 px-4 sm:px-7 py-3 text-[12px] text-white/40">
              <FooterHint label="Navigate" keys={['↑', '↓']} />
              <FooterHint label="Open" keys={['↵']} />
              <span className="hidden sm:contents">
                <FooterHint label="New tab" keys={['⌘', '↵']} />
                <FooterHint label="Close" keys={['esc']} />
              </span>
            </div>
          </div>
        </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function FooterHint({ label, keys }: { label: string; keys: string[] }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{label}</span>
      {keys.map((k) => (
        <kbd
          key={k}
          className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded bg-white/[0.06] px-1 font-sans text-[10.5px] font-medium leading-none text-white/55"
        >
          {k}
        </kbd>
      ))}
    </span>
  )
}
