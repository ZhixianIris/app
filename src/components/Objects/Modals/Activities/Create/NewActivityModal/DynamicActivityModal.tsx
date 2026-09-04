import React, { useState } from 'react'
import BarLoader from 'react-spinners/BarLoader'
import { Browsers } from '@phosphor-icons/react'
import { Form } from "@base-ui/react/form";
import { Field } from "@base-ui/react/field";

function DynamicCanvaModal({ submitActivity, chapterId, course }: any) {
  const [activityName, setActivityName] = useState('')
  const [activityDescription, setActivityDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsSubmitting(true)
    await submitActivity({
      name: activityName,
      chapter_id: chapterId,
      activity_type: 'TYPE_DYNAMIC',
      activity_sub_type: 'SUBTYPE_DYNAMIC_PAGE',
      published_version: 1,
      version: 1,
      course_id: course.id,
    })
    setIsSubmitting(false)
  }

  return (
    <Form onSubmit={handleSubmit} className="space-y-4">
      <div
        className="relative flex items-center justify-center h-20 rounded-xl overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(191,219,254,0.3) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      >
        <span className="flex items-center gap-2 bg-white nice-shadow rounded-full px-4 py-1.5 text-sm font-medium text-gray-600">
          <Browsers size={18} weight="duotone" className="text-blue-400" />
          Dynamic Page
        </span>
      </div>

      <div className="rounded-xl nice-shadow p-4 space-y-4">
        <Field name="dynamic-activity-name" className="space-y-1.5">
          <Field.Label className="text-sm font-medium text-gray-700">
            Activity name
          </Field.Label>
          <Field.Error match="valueMissing" className="text-xs text-red-500">
            Please provide a name
          </Field.Error>
                          <Field.Control render={<input
              onChange={(e) => setActivityName(e.target.value)}
              type="text"
              required
              placeholder="Enter a name..."
              className="w-full h-9 px-3 text-sm rounded-lg bg-gray-50 border border-gray-200 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-colors"
            />} />
        </Field>

        <Field name="dynamic-activity-desc" className="space-y-1.5">
          <Field.Label className="text-sm font-medium text-gray-700">
            Description
          </Field.Label>
                          <Field.Control render={<textarea
              onChange={(e) => setActivityDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-colors resize-none"
            />} />
        </Field>
      </div>

      <div className="flex justify-end">
                    <button type="submit"
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center h-9 px-5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <BarLoader
                cssOverride={{ borderRadius: 60 }}
                width={60}
                color="#ffffff"
              />
            ) : (
              'Create activity'
            )}
          </button>
      </div>
    </Form>
  )
}

export default DynamicCanvaModal
