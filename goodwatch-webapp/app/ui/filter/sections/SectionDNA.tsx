import {
	ArrowPathIcon,
	CheckIcon,
	MagnifyingGlassIcon,
	TagIcon,
} from "@heroicons/react/20/solid"
import React from "react"
import Highlighter from "react-highlight-words"
import { useDNA } from "~/routes/api.dna"
import type { DiscoverParams } from "~/server/discover.server"
import type { DNAResult } from "~/server/dna.server"
import { discoverFilters } from "~/server/types/discover-types"
import OneOrMoreItems from "~/ui/filter/OneOrMoreItems"
import EditableSection from "~/ui/filter/sections/EditableSection"
import Autocomplete, {
	type AutocompleteItem,
	type RenderItemParams,
} from "~/ui/form/Autocomplete"
import { Tag } from "~/ui/tags/Tag"
import { Ping } from "~/ui/wait/Ping"
import { useNav } from "~/utils/navigation"
import { useDebounce } from "~/utils/timing"

interface SectionDNAParams {
	params: DiscoverParams
	editing: boolean
	onEdit: () => void
	onClose: () => void
}

export default function SectionDNA({
	params,
	editing,
	onEdit,
	onClose,
}: SectionDNAParams) {
	const [searchText, setSearchText] = React.useState("")
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchText(event.target.value)
	}
	const debouncedSearchText = useDebounce(searchText, 200)

	// data retrieval
	const { similarDNA = "" } = params
	const dnaResult = useDNA({
		text: debouncedSearchText,
		similarDNA,
	})
	const dna = dnaResult.data?.result || []

	const dnaKeys = (similarDNA || "").split(",").filter(Boolean)
	const dnaToInclude = similarDNA
		.split(",")
		.filter(Boolean)
		.map((dna) => {
			const [category, label] = dna.split(":", 2)
			return {
				category,
				label,
			}
		})

	// autocomplete data

	const autocompleteItems = dna.map((dna: DNAResult) => {
		const key = `${dna.category}:${dna.label}`
		const label = dna.label
		return {
			key,
			label,
			category: dna.category,
			count: dna.count_all,
		}
	})
	const autocompleteRenderItem = ({
		item,
	}: RenderItemParams<
		AutocompleteItem & { category: string; count: number }
	>) => {
		const isSelected = dnaKeys.includes(item.key)
		return (
			<div
				className={`w-full flex items-center justify-between gap-4 ${isSelected ? "text-green-400" : ""}`}
			>
				<div className="flex items-center gap-4">
					<div
						className="text-sm font-bold truncate"
						title={`Used in ${item.count} movies and shows`}
					>
						<div className="w-52 text-gray-400 font-medium">
							{item.category}{" "}
						</div>
						<Highlighter
							highlightClassName="font-bold bg-yellow-500 text-gray-900"
							searchWords={[searchText]}
							autoEscape={true}
							textToHighlight={item.label}
						/>
					</div>
				</div>
				{isSelected && (
					<CheckIcon
						className="h-6 w-6 p-1 text-green-100 bg-green-700 rounded-full"
						aria-hidden="true"
					/>
				)}
			</div>
		)
	}

	// update handlers

	const { updateQueryParams } = useNav<Pick<DiscoverParams, "similarDNA">>()
	const updateDNA = (dnaToInclude: DNAResult[]) => {
		updateQueryParams({
			similarDNA: dnaToInclude
				.map((dna) => `${dna.category}:${dna.label}`)
				.join(","),
		})
		setSearchText("")
	}

	const handleSelect = (
		selectedItem: AutocompleteItem & { category: string; count: number },
	) => {
		const updatedDNAToInclude: DNAResult[] = dnaKeys.includes(selectedItem.key)
			? dnaToInclude.filter(
					(dna) => `${dna.category}:${dna.label}` !== selectedItem.key,
				)
			: [
					...dnaToInclude,
					{
						category: selectedItem.category,
						label: selectedItem.label,
						count_all: selectedItem.count,
					},
				]
		updateDNA(updatedDNAToInclude)
	}

	const handleDelete = (dnaToDelete: DNAResult) => {
		const updatedDNAToInclude: DNAResult[] = dnaToInclude.filter(
			(dna) =>
				`${dna.category}:${dna.label}` !==
				`${dnaToDelete.category}:${dnaToDelete.label}`,
		)
		updateDNA(updatedDNAToInclude)
	}

	const handleRemoveAll = () => {
		updateDNA([])
		onClose()
	}

	// rendering

	return (
		<EditableSection
			label={discoverFilters.dna.label}
			color={discoverFilters.dna.color}
			visible={dnaKeys.length > 0}
			editing={editing}
			active={true}
			onEdit={onEdit}
			onClose={onClose}
			onRemoveAll={handleRemoveAll}
		>
			{(isEditing) => (
				<div className="flex flex-col flex-wrap gap-2">
					{isEditing && (
						<div className="w-[18rem] xs:w-[20rem] sm:w-[22rem] md:w-[24rem] lg:w-[26rem] xl:w-[28rem]">
							<Autocomplete<AutocompleteItem>
								name="query"
								placeholder="Search DNA"
								icon={
									dnaResult.isFetching ? (
										<ArrowPathIcon
											className="h-4 w-4 text-gray-400 animate-spin"
											aria-hidden="true"
										/>
									) : (
										<MagnifyingGlassIcon
											className="h-4 w-4 text-gray-400"
											aria-hidden="true"
										/>
									)
								}
								autocompleteItems={autocompleteItems}
								renderItem={autocompleteRenderItem}
								onChange={handleChange}
								onSelect={handleSelect}
							/>
						</div>
					)}
					<div className="flex flex-wrap items-center gap-2">
						{dnaToInclude.length > 0 ? (
							dnaToInclude.map((dna, index) => (
								<OneOrMoreItems
									key={`${dna.category}:${dna.label}`}
									index={index}
									amount={dnaToInclude.length}
								>
									<Tag
										icon={TagIcon}
										onRemove={isEditing ? () => handleDelete(dna) : undefined}
									>
										<span className="text-gray-500">{dna.category}: </span>
										<span className="font-bold">{dna.label}</span>
									</Tag>
								</OneOrMoreItems>
							))
						) : dnaResult.isLoading && dna.length === 0 ? (
							<div className="relative h-8">
								<Ping size="small" />
							</div>
						) : null}
					</div>
				</div>
			)}
		</EditableSection>
	)
}
