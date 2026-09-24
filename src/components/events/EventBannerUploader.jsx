import React from 'react'

export default function EventBannerUploader({
  bannerPreview,
  onImageChange,
  onRemoveImage,
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 font-mono">
        Cover Banner Artwork
      </label>
      <div className="rounded-md border border-dashed border-stone-300 p-6 bg-stone-50/50 flex flex-col items-center justify-center text-center">
        {bannerPreview ? (
          <div className="space-y-3 w-full max-w-md">
            <img src={bannerPreview} alt="Cover Preview" className="h-44 w-full object-cover rounded border border-stone-200" />
            <button
              type="button"
              onClick={onRemoveImage}
              className="text-xs font-mono text-red-600 hover:underline cursor-pointer"
            >
              Remove artwork
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-10 w-10 mx-auto rounded-full bg-stone-200 text-stone-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.22a.75.75 0 0 0-1.06 0l-1.91 1.91-4.72-4.72a.75.75 0 0 0-1.06 0L2.5 11.06Zm10-4.06a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex text-xs text-stone-600 justify-center">
              <label
                htmlFor="banner-upload"
                className="relative cursor-pointer rounded font-medium text-stone-900 underline underline-offset-2 hover:text-stone-700"
              >
                <span>Upload a banner image</span>
                <input
                  id="banner-upload"
                  name="banner"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={onImageChange}
                />
              </label>
            </div>
            <p className="text-[11px] text-stone-400 font-mono">PNG, JPG, WebP up to 5MB (16:9 ratio recommended)</p>
          </div>
        )}
      </div>
    </div>
  )
}
