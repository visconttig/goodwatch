import { DataSourceConfigForMedia, DataSourceForMedia, MediaData } from '../dataSource'
import {
  getTMDBMovieCollection,
  getTMDBMovieDetails,
  getTMDBTvDetails,
  saveTMDBAlternativeTitles,
  saveTMDBCast,
  saveTMDBCertifications,
  saveTMDBCollection,
  saveTMDBCrew,
  saveTMDBGenres, saveTMDBKeywords, saveTMDBMediaImages, saveTMDBMediaRelations, saveTMDBMediaVideos,
  saveTMDBMovie, saveTMDBNetworks, saveTMDBProductionCompanies, saveTMDBStreamingProviders, saveTMDBTranslations,
  saveTMDBTv, saveTMDBTVSeasons,
} from './tmdb-details-handler'
import {TMDBCollection, TMDBMovieDetails, TMDBTvDetails} from "../../types/details.types";

export interface FetchedMovieData {
  details: TMDBMovieDetails
  collection?: TMDBCollection
}

export interface FetchedTvData {
  details: TMDBTvDetails
}

// @ts-ignore
export class DataSourceTMDBDetails extends DataSourceForMedia {
  getConfig(): DataSourceConfigForMedia {
    return {
      name: "tmdb_details",
      classDefinition: DataSourceTMDBDetails,
      updateIntervalMinutes: 60 * 24 * 7,
      retryIntervalSeconds: 30,
      batchSize: 20,
      batchDelaySeconds: 0,
      rateLimitDelaySeconds: 60,
      usesExistingMedia: false,
    }
  }

  async fetchMovieData({ tmdb_id }: MediaData): Promise<FetchedMovieData> {
    const details = await getTMDBMovieDetails(tmdb_id)

    let collection: TMDBCollection | undefined
    if (details.belongs_to_collection) {
      collection = await getTMDBMovieCollection(details.belongs_to_collection.id)
    }

    return {
      details,
      collection,
    }
  }

  async fetchTvData({ tmdb_id }: MediaData): Promise<FetchedTvData> {
    const details = await getTMDBTvDetails(tmdb_id)

    return {
      details,
    }
  }

  async storeMovieData(data: FetchedMovieData): Promise<void> {
    const mediaId = await saveTMDBMovie(data.details);
    const promises = [
      saveTMDBCollection(mediaId, data.collection),
      saveTMDBGenres(mediaId, data.details.genres),
      saveTMDBKeywords(mediaId, data.details.keywords, 'movie', data.details.id),
      saveTMDBAlternativeTitles(mediaId, data.details.alternative_titles.titles),
      (async () => {
        await saveTMDBCast(mediaId, data.details.credits.cast)
        await saveTMDBCrew(mediaId, data.details.credits.crew)
      })(),
      saveTMDBCertifications(mediaId, data.details.release_dates.results),
      saveTMDBStreamingProviders(mediaId, data.details['watch/providers']),
      saveTMDBMediaImages(mediaId, data.details.images),
      saveTMDBMediaVideos(mediaId, data.details.videos),
      saveTMDBProductionCompanies(mediaId, data.details.production_companies),
      saveTMDBTranslations(mediaId, data.details.translations),
      saveTMDBMediaRelations(mediaId, data.details.recommendations, data.details.similar),
    ]
    await Promise.all(promises)
  }

  async storeTvData(data: FetchedTvData): Promise<void> {
    const mediaId = await saveTMDBTv(data.details)
    const promises: Promise<unknown>[] = [
      saveTMDBGenres(mediaId, data.details.genres),
      saveTMDBAlternativeTitles(mediaId, data.details.alternative_titles.results),
      saveTMDBKeywords(mediaId, data.details.keywords, 'tv', data.details.id),
      (async () => {
        await saveTMDBCast(mediaId, data.details.aggregate_credits.cast)
        await saveTMDBCrew(mediaId, data.details.aggregate_credits.crew)
        // TODO creator / created_by
      })(),
      saveTMDBCertifications(mediaId, data.details.content_ratings.results),
      saveTMDBStreamingProviders(mediaId, data.details['watch/providers']),
      saveTMDBMediaImages(mediaId, data.details.images),
      saveTMDBMediaVideos(mediaId, data.details.videos),
      saveTMDBProductionCompanies(mediaId, data.details.production_companies),
      saveTMDBNetworks(mediaId, data.details.networks),
      saveTMDBTranslations(mediaId, data.details.translations),
      saveTMDBMediaRelations(mediaId, data.details.recommendations, data.details.similar),
      saveTMDBTVSeasons(mediaId, data.details.seasons),
    ]
    await Promise.all(promises)
  }

}