import React from "react"
import { getCategoryColor, mapCategoryToVectorName } from "~/ui/dna/utils"

export interface DNATagProps {
	category: string
	label: string
	linkDisabled?: boolean
}

export function DNATag({ category, label, linkDisabled = false }: DNATagProps) {
	const vectorCategory = mapCategoryToVectorName(category)

	const tagElement = (
		<span
			className={`${getCategoryColor(category)} text-white text-lg border-gray-600 border-2 px-2 rounded-md`}
		>
			{label}
		</span>
	)

	return linkDisabled ? (
		tagElement
	) : (
		<a
			href={
				linkDisabled ? undefined : `/explore/all/${vectorCategory}/${label}`
			}
		>
			{tagElement}
		</a>
	)
}
