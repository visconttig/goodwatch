import React from "react"
import type { Cast as CastType } from "~/server/details.server"

export interface CastProps {
	cast: CastType[]
}

export default function Cast({ cast }: CastProps) {
	const castWithPhotos = (cast || []).filter(
		(castMember) => castMember.profile_path,
	)
	const castWithoutPhotos = (cast || []).filter(
		(castMember) => !castMember.profile_path,
	)

	const type = "all"
	return (
		<>
			<h2 className="text-2xl font-bold">Cast</h2>
			<div className="mt-4 flex flex-wrap gap-2">
				{(castWithPhotos || []).map((castMember) => {
					const character =
						castMember.character || castMember.roles?.[0].character
					return (
						<a
							key={castMember.id}
							href={`/discover?type=${type}&withCast=${castMember.id}`}
							className="w-28 h-60 border-2 border-gray-700 flex flex-col items-center group"
						>
							<img
								className="w-full h-auto"
								src={`https://www.themoviedb.org/t/p/original/${castMember.profile_path}`}
								alt={`${castMember.name} profile photo`}
							/>
							<div className="w-full h-full px-2 bg-gray-800 group-hover:bg-slate-800">
								<p
									className="text-sm text-center font-bold truncate w-full mt-3"
									title={castMember.name}
								>
									{castMember.name}
								</p>
								<p
									className="text-sm text-center font-italic truncate w-full mt-2"
									title={character}
								>
									{character}
								</p>
							</div>
						</a>
					)
				})}
			</div>
			<div className="mt-8 flex flex-wrap gap-4">
				{(castWithoutPhotos || []).map((castMember) => {
					const character =
						castMember.character || castMember.roles?.[0].character
					return (
						<a
							key={castMember.id}
							href={`/discover?type=${type}&withCast=${castMember.id}`}
							className="w-64 h-16 hover:bg-slate-800"
						>
							<strong>{castMember.name}</strong>{" "}
							{character && (
								<>
									as <em>{character}</em>
								</>
							)}
						</a>
					)
				})}
			</div>
		</>
	)
}
