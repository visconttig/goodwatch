import { FilmIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import {
	type StreamingProvider,
	useStreamingProviders,
} from "~/routes/api.streaming-providers";
import { useUserSettings } from "~/routes/api.user-settings.get";
import NextBackButtons from "~/ui/button/NextBackButtons";
import SubmitButton from "~/ui/button/SubmitButton";
import YesNoButtons from "~/ui/button/YesNoButtons";
import { SearchInput } from "~/ui/form/SearchInput";
import StreamingProviderSelection from "~/ui/onboarding/StreamingProviderSelection";
import StreamingProviderToggle from "~/ui/onboarding/StreamingProviderToggle";
import { useAutoFocus } from "~/utils/form";

interface SelectStreamingProps {
	mode: "onboarding" | "settings";
	onSelect: (streamingProviderIds: string[]) => void;
}

export default function SelectStreaming({
	mode,
	onSelect,
}: SelectStreamingProps) {
	const { data: userSettings } = useUserSettings();

	// pre-selection

	const storedStreaming =
		userSettings?.streaming_providers_default ||
		(typeof window !== "undefined"
			? localStorage.getItem("withStreamingProviders")
			: undefined);
	const preselectedStreaming = storedStreaming
		? storedStreaming.split(",")
		: [];

	// get all providers

	const { data: streamingProviders } = useStreamingProviders();

	// filtered streaming providers

	const [filterText, setFilterText] = useState("");
	const handleFilterByName = (text: string) => {
		setFilterText(text);
	};
	const filteredStreamingProviders = streamingProviders?.filter((provider) => {
		return provider.name.toLowerCase().includes(filterText.toLowerCase());
	});

	// toggle selection mode

	const [streamingSelectionEnabled, setStreamingSelectionEnabled] = useState(
		preselectedStreaming.length === 0 || mode === "settings",
	);
	const handleStreamingDeclined = () => {
		setStreamingSelectionEnabled(true);
		setSelectedStreaming(preselectedStreaming);
	};
	const handleStreamingBack = () => {
		setStreamingSelectionEnabled(false);
	};

	// streaming selection

	const autoFocusRef = useAutoFocus<HTMLInputElement>();
	const [selectedStreaming, setSelectedStreaming] =
		useState<string[]>(preselectedStreaming);

	const handleToggleProvider = (
		provider: StreamingProvider,
		selected: boolean,
	) => {
		setSelectedStreaming((prev) => {
			const providerId = String(provider.id);

			// If selected and not already in the list, add it
			if (selected && !(prev || []).includes(providerId)) {
				return (streamingProviders || [])
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
						{selectedStreaming.length > 0 ? (
							selectedStreaming.map((providerId) => {
								const provider = streamingProviders?.find(
									(provider) => provider.id === Number.parseInt(providerId),
								);
								if (!provider) return null;
								return (
									<StreamingProviderSelection
										key={provider.id}
										provider={provider}
									/>
								);
							})
						) : (
							<div className="p-2 bg-slate-800 border-2 border-slate-950 text-2xl italic">
								No streaming services selected
							</div>
						)}
					</div>
					{mode === "onboarding" && (
						<NextBackButtons
							onNext={handleStreamingConfirmed}
							onBack={handleStreamingBack}
						/>
					)}
					{mode === "settings" && (
						<SubmitButton loading={false} onSubmit={handleStreamingConfirmed}>
							Save Streaming Selection
						</SubmitButton>
					)}
					<div className="mt-6 w-full flex items-center justify-center">
						<SearchInput
							id="search-streaming"
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
					<div className="flex flex-wrap justify-center gap-2 md:gap-5">
						{filteredStreamingProviders?.map((provider) => {
							return (
								<StreamingProviderToggle
									key={provider.id}
									provider={provider}
									selected={selectedStreaming.includes(String(provider.id))}
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
			) : (
				<>
					<div className="flex flex-wrap justify-center gap-5">
						{userStreaming.length > 0 ? (
							userStreaming.map((providerId) => {
								const provider = streamingProviders?.find(
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
							})
						) : (
							<div className="p-2 bg-slate-800 border-2 border-slate-950 text-2xl italic">
								No streaming services selected
							</div>
						)}
					</div>
					<div className="flex flex-col gap-2">
						<div className="text-center font-semibold">Is this correct?</div>
						<YesNoButtons
							onYes={handleStreamingConfirmed}
							onNo={handleStreamingDeclined}
						/>
					</div>
				</>
			)}
		</>
	);
}
