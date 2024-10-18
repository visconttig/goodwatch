import { XCircleIcon } from "@heroicons/react/20/solid"
import type { ComponentType, HTMLAttributes, ReactNode } from "react"

export interface TagProps {
	icon?: ComponentType<HTMLAttributes<SVGElement>>
	onRemove?: () => void
	children: ReactNode
}

export const Tag = ({ icon: Icon, onRemove, children }: TagProps) => {
	return (
		<span className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded">
			{Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
			{children}
			{onRemove && (
				<XCircleIcon
					className="ml-2 h-5 w-5 cursor-pointer text-red-500 hover:text-red-600"
					onClick={onRemove}
				/>
			)}
		</span>
	)
}
