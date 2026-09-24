import React from 'react'

export default function EventFormOverviewSection({ formik }) {
  return (
    <div className="rounded-lg border border-stone-200/80 bg-white p-6 shadow-2xs space-y-5">
      <div className="border-b border-stone-100 pb-3">
        <h2 className="font-serif text-base font-medium text-stone-900">Stage Overview</h2>
        <p className="text-xs text-stone-500">Essential details shown across discovery and search</p>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="title" className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
          Event Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="e.g. Symphony at Twilight"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.title}
          className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 transition-all ${
            formik.touched.title && formik.errors.title
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
          }`}
        />
        {formik.touched.title && formik.errors.title && (
          <p className="text-xs text-red-600 tracking-tight">{formik.errors.title}</p>
        )}
      </div>

      {/* Category & Online Toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="category" className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
            Category
          </label>
          <select
            id="category"
            name="category"
            onChange={formik.handleChange}
            value={formik.values.category}
            className="w-full rounded-md border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
          >
            <option value="Music & Concerts">Music &amp; Concerts</option>
            <option value="Tech & Conferences">Tech &amp; Conferences</option>
            <option value="Food & Tasting">Food &amp; Tasting</option>
            <option value="Nightlife">Nightlife</option>
            <option value="Art & Exhibitions">Art &amp; Exhibitions</option>
            <option value="Workshops">Workshops</option>
            <option value="Conference">Conference</option>
            <option value="Exhibition & Tasting">Exhibition &amp; Tasting</option>
            <option value="Club Night">Club Night</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
            Event Format
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-md border border-stone-200/80">
            <button
              type="button"
              onClick={() => formik.setFieldValue('isOnline', false)}
              className={`py-1.5 px-3 text-xs font-medium rounded transition-all cursor-pointer ${
                !formik.values.isOnline ? 'bg-stone-900 text-stone-50 shadow-sm' : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              In-Person Venue
            </button>
            <button
              type="button"
              onClick={() => formik.setFieldValue('isOnline', true)}
              className={`py-1.5 px-3 text-xs font-medium rounded transition-all cursor-pointer ${
                formik.values.isOnline ? 'bg-stone-900 text-stone-50 shadow-sm' : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              Virtual / Stream
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
          About the Event
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Describe the experience, line-up, special guidelines, age limits, and dress codes..."
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.description}
          className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 transition-all leading-relaxed ${
            formik.touched.description && formik.errors.description
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-stone-300 focus:border-stone-900 focus:ring-stone-900'
          }`}
        />
        {formik.touched.description && formik.errors.description && (
          <p className="text-xs text-red-600 tracking-tight">{formik.errors.description}</p>
        )}
      </div>
    </div>
  )
}
