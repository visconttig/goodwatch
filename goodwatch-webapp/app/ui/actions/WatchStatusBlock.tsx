import React, { useState } from 'react'
import { PlusCircleIcon, MinusCircleIcon, EyeIcon, EyeSlashIcon, HeartIcon } from '@heroicons/react/24/solid'
import UserAction from '~/ui/auth/UserAction'
import { MovieDetails, TVDetails } from '~/server/details.server'
import WishListAction from '~/ui/actions/WishListAction'
import { useLoaderData } from '@remix-run/react'
import { LoaderData } from '~/routes/movie.$movieKey'
import WatchHistoryAction from '~/ui/actions/WatchHistoryAction'

export interface WatchStatusBlockProps {
  details: MovieDetails | TVDetails
}

export default function WatchStatusBlock({ details }: WatchStatusBlockProps) {
  const [activeButton, setActiveButton] = useState<"wishList" | "watchHistory" | "favorite" | null>(null)

  const { wishList, watchHistory } = useLoaderData<LoaderData>()
  const { tmdb_id, media_type } = details
  const isInWishList = wishList?.[media_type]?.[tmdb_id]?.onWishList
  const isInWatchHistory = watchHistory?.[media_type]?.[tmdb_id]?.onWatchHistory
  const isFavorite = false

  const WishListIcon = isInWishList && activeButton === 'wishList' ? MinusCircleIcon : PlusCircleIcon
  const wishListColor = isInWishList && activeButton !== 'wishList' ? 'text-green-500' : 'text-gray-400'
  const wishlistText = isInWishList ? 'On Wishlist' : 'Add to Wishlist'
  const wishlistAction = isInWishList ? 'Remove from Wishlist' : 'Add to Wishlist'

  const WatchHistoryIcon = isInWatchHistory && activeButton === 'watchHistory' ? EyeSlashIcon : EyeIcon
  const watchHistoryColor = isInWatchHistory && activeButton !== 'watchHistory' ? 'text-green-500' : 'text-gray-400'
  const watchHistoryText = isInWatchHistory ? 'Already Watched' : 'Add to Watched'
  const watchHistoryAction = isInWatchHistory ? 'Remove from Watched' : 'Add to Watched'

  const FavoriteIcon = HeartIcon
  const favoriteColor = isFavorite && activeButton !== 'favorite' ? 'text-red-500' : 'text-gray-400'
  const favoriteText = isFavorite || activeButton !== "favorite" ? 'Favorite' : 'Favorite'
  const favoriteAction = isFavorite ? 'Remove from Favorites' : 'Favorite'

  return (
    <div className="overflow-hidden py-2 rounded-lg bg-gray-900 bg-opacity-50 shadow">
      <div className="flex flex-col gap-4 items-center justify-evenly px-4 py-2 md:py-4">
        <WishListAction details={details}>
          <button
            type="submit"
            className="rounded-md w-full px-3.5 py-2.5 flex items-center justify-center gap-2 text-sm md:text-md font-semibold text-white shadow-sm bg-slate-700 hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
            onPointerEnter={() => setActiveButton("wishList")}
            onPointerLeave={() => setActiveButton(null)}
          >
            <WishListIcon className={`h-5 w-auto ${wishListColor}`} />
            {activeButton === "wishList" ? wishlistAction : wishlistText}
          </button>
        </WishListAction>
        <WatchHistoryAction details={details}>
          <button
            type="submit"
            className="rounded-md w-full px-3.5 py-2.5 flex items-center justify-center gap-2 text-sm md:text-md font-semibold text-white shadow-sm bg-slate-700 hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
            onPointerEnter={() => setActiveButton("watchHistory")}
            onPointerLeave={() => setActiveButton(null)}
          >
            <WatchHistoryIcon className={`h-5 w-auto ${watchHistoryColor}`} />
            {activeButton === "watchHistory" ? watchHistoryAction : watchHistoryText}
          </button>
        </WatchHistoryAction>
        <UserAction instructions={<>Save your all-time favorites.</>}>
          <a
            href="#"
            className="rounded-md w-full px-3.5 py-2.5 flex items-center justify-center gap-2 text-sm md:text-md font-semibold text-white shadow-sm bg-slate-700 hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
            onClick={() => console.log("click favorite")}
            onPointerEnter={() => setActiveButton("favorite")}
            onPointerLeave={() => setActiveButton(null)}
          >
            <FavoriteIcon className={`h-5 w-auto ${favoriteColor}`} />
            {activeButton === "favorite" ? favoriteAction : favoriteText}
          </a>
        </UserAction>
      </div>
    </div>
  )
}
