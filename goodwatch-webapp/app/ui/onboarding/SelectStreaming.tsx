import { FilmIcon } from "@heroicons/react/24/solid";
import { useFetcher } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import type {
	StreamingProvider,
	StreamingProviderResults,
} from "~/server/streaming-providers.server";
import NextBackButtons from "~/ui/button/NextBackButtons";
import YesNoButtons from "~/ui/button/YesNoButtons";
import { TextInput } from "~/ui/form/TextInput";
import StreamingProviderSelection from "~/ui/onboarding/StreamingProviderSelection";
import StreamingProviderToggle from "~/ui/onboarding/StreamingProviderToggle";
import { useAutoFocus } from "~/utils/form";

interface SelectStreamingProps {
	onSelect: (streamingProviderIds: string[]) => void;
}

export default function SelectStreaming({ onSelect }: SelectStreamingProps) {
	// pre-selection
	const storedStreaming =
		typeof window !== "undefined"
			? localStorage.getItem("withStreamingProviders")
			: undefined;
	const preselectedStreaming = (storedStreaming || "").split(",");

	// get all providers
	const providersFetcher = useFetcher<{
		streamingProviders: StreamingProviderResults;
	}>();
	useEffect(() => {
		const type = "movie";
		providersFetcher.submit(
			{ type },
			{
				method: "get",
				action: "/api/discover/streaming-providers",
			},
		);
	}, []);
	const streamingProviders = providersFetcher.data?.streamingProviders || [];

	// filtered streaming providers
	const [filterText, setFilterText] = useState("");
	const handleFilterByName = (text: string) => {
		setFilterText(text);
	};
	const filteredStreamingProviders = streamingProviders.filter((provider) => {
		return provider.name.toLowerCase().includes(filterText.toLowerCase());
	});

	// defaults or selection
	const [streamingSelectionEnabled, setStreamingSelectionEnabled] =
		useState(false);
	const handleStreamingDeclined = () => {
		setStreamingSelectionEnabled(true);
		setSelectedStreaming(preselectedStreaming);
	};
	const handleStreamingBack = () => {
		setStreamingSelectionEnabled(false);
	};

	// selection
	const autoFocusRef = useAutoFocus<HTMLInputElement>();
	const [selectedStreaming, setSelectedStreaming] = useState<string[]>([]);

	const handleToggleProvider = (
		provider: StreamingProvider,
		selected: boolean,
	) => {
		setSelectedStreaming((prev) => {
			const providerId = String(provider.id);

			// If selected and not already in the list, add it
			if (selected && !(prev || []).includes(providerId)) {
				return streamingProviders
					.filter(
						(streamingProvider) =>
							(prev || []).includes(String(streamingProvider.id)) ||
							String(streamingProvider.id) === providerId,
					)
					.map((streamingProvider) => String(streamingProvider.id));
			}

			// If not selected, remove it
			if (!selected) {
				return (prev || []).filter((id) => id !== providerId);
			}

			return prev;
		});
	};

	const handleStreamingConfirmed = () => {
		onSelect(
			streamingSelectionEnabled ? selectedStreaming : preselectedStreaming,
		);
	};

	const userStreaming = selectedStreaming.length
		? selectedStreaming
		: preselectedStreaming;

	return (
		<>
			{streamingSelectionEnabled ? (
				<>
					<div className="flex flex-wrap justify-center gap-5">
						{selectedStreaming.map((providerId) => {
							const provider = streamingProviders.find(
								(provider) => provider.id === Number.parseInt(providerId),
							);
							if (!provider) return null;
							return (
								<StreamingProviderSelection
									key={provider.id}
									provider={provider}
								/>
							);
						})}
					</div>
					<NextBackButtons
						onNext={handleStreamingConfirmed}
						onBack={handleStreamingBack}
					/>
					<div className="mt-6">
						<TextInput
							label="Search"
							placeholder="Search Streaming Providers"
							icon={
								<FilmIcon
									className="h-5 w-5 text-gray-400"
									aria-hidden="true"
								/>
							}
							onChange={handleFilterByName}
							ref={autoFocusRef}
						/>
					</div>
					<div className="flex flex-wrap justify-center gap-5">
						{filteredStreamingProviders.map((provider) => {
							return (
								<StreamingProviderToggle
									key={provider.id}
									provider={provider}
									selected={
										selectedStreaming.includes(String(provider.id)) || false
									}
									onToggle={handleToggleProvider}
								/>
							);
						})}
					</div>
					<NextBackButtons
						onNext={handleStreamingConfirmed}
						onBack={handleStreamingBack}
					/>
				</>
			) : userStreaming ? (
				<>
					<div className="flex flex-wrap gap-5">
						{userStreaming.map((providerId) => {
							const provider = streamingProviders.find(
								(provider) => provider.id === Number.parseInt(providerId),
							);
							if (!provider) return null;
							return (
								<StreamingProviderToggle
									key={provider.id}
									provider={provider}
									selectable={false}
								/>
							);
						})}
					</div>
					<div className="flex flex-col gap-2">
						<div className="font-semibold">Is this correct?</div>
						<YesNoButtons
							onYes={handleStreamingConfirmed}
							onNo={handleStreamingDeclined}
						/>
					</div>
				</>
			) : (
				<>
					<div>Loading...</div>
				</>
			)}
		</>
	);
}