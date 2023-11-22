import React, { useState } from 'react'
import InfoBox from '~/ui/InfoBox'
import imdbLogo from '~/img/imdb-logo-250.png'
import metacriticLogo from '~/img/metacritic-logo-250.png'
import rottenLogo from '~/img/rotten-logo-250.png'
import { AllRatings } from '~/utils/ratings'

export interface RatingsProps {
  ratings?: AllRatings
  title?: string
  compact?: boolean
}

export default function RatingBadges({ ratings }: RatingsProps) {
  const isComplete = Boolean(ratings)

  return (
    <div className="relative">
      {!isComplete && (
        <div className="absolute top-16 left-6 z-10">
          <InfoBox text="Ratings are currently calculated..." />
        </div>
      )}
      <ul className={`underline-offset-2 flex gap-3 sm:gap-6  ${isComplete ? '' : 'opacity-50'}`}>
        <a className="" href={ratings?.imdb_url} target="_blank">
          <dl className={`${ratings?.imdb_url ? 'hover:border-white/[.45] active:border-white/[.45]' : 'opacity-60'} rounded-lg border-4 border-black/[.3] h-full px-2 bg-imdb shadow overflow-hidden text-center flex items-center gap-2`}>
            <img className="hidden sm:block h-4 object-contain" src={imdbLogo} alt="IMDb Logo" title="IMDb Logo" />
            <dd className="text-sm font-semibold tracking-tight text-gray-900">{ratings?.imdb_user_score_original ? ratings?.imdb_user_score_original.toFixed(1) : '--'}</dd>
          </dl>
        </a>

        <a className="" href={ratings?.metacritic_url} target="_blank">
          <dl className={`${ratings?.metacritic_url ? 'hover:border-white/[.45] active:border-white/[.45]' : 'opacity-60'} rounded-lg border-4 border-white/[.2] h-full px-2 bg-metacritic shadow overflow-hidden text-center flex items-center gap-2`}>
            <img className="hidden sm:block h-4 object-contain" src={metacriticLogo} alt="Metacritic Logo" title="Metacritic Logo" />
            <dd className="text-sm font-semibold tracking-tight text-gray-100">{ratings?.metacritic_meta_score_original ? Math.floor(ratings?.metacritic_meta_score_original) : '--'}</dd>
            |
            <dd className="text-sm font-semibold tracking-tight text-gray-100">{ratings?.metacritic_user_score_original ? ratings?.metacritic_user_score_original.toFixed(1) : '--'}</dd>
          </dl>
        </a>

        <a className="" href={ratings?.rotten_tomatoes_url} target="_blank">
          <dl className={`${ratings?.rotten_tomatoes_url ? 'hover:border-white/[.45] active:border-white/[.45]' : 'opacity-60'} rounded-lg border-4 border-black/[.3] h-full px-2 bg-rotten shadow overflow-hidden text-center flex items-center gap-2`}>
            <img className="hidden sm:block h-4 object-contain" src={rottenLogo} alt="Rotten Tomatoes Logo" title="Rotten Tomatoes Logo" />
            <dd className="text-sm font-semibold tracking-tight text-gray-50">{ratings?.rotten_tomatoes_tomato_score_original ? Math.floor(ratings?.rotten_tomatoes_tomato_score_original) : '--'}</dd>
            |
            <dd className="text-sm font-semibold tracking-tight text-gray-50 no-underline">{ratings?.rotten_tomatoes_audience_score_original ? Math.floor(ratings?.rotten_tomatoes_audience_score_original) : '--'}</dd>
          </dl>
        </a>
      </ul>
    </div>
  )
}
