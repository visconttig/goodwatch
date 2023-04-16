import {sleep} from "../utils/helpers";
import {pool} from "../db/db";
import {DataSource, DataSourceConfig, DataSourceForImport, DataSourceForMedia} from "./dataSource";
import {AxiosError} from "axios";

export const processDataSource = async (
  dataSource: DataSource,
) => {
  const dataSourceConfig = dataSource.getConfig()
  while (true) {
    try {
      if (dataSource instanceof DataSourceForMedia) {
        // Get the next batch of entries that need to be processed for this data source
        const batchSize = dataSourceConfig.batchSize;
        const query = `
          SELECT daily_media.tmdb_id, daily_media.media_type_id
          FROM daily_media
          LEFT JOIN media ON media.tmdb_id = daily_media.tmdb_id
          LEFT JOIN data_sources_for_media
            ON data_sources_for_media.tmdb_id = media.tmdb_id
            AND data_sources_for_media.media_type_id = media.media_type_id
            AND data_sources_for_media.data_source_id = (SELECT id FROM data_sources WHERE name = '${dataSourceConfig.name}')
          WHERE (
            media.id IS NULL
            OR data_sources_for_media.last_successful_attempt_at IS NULL
            OR now() - data_sources_for_media.last_successful_attempt_at >= '60 minutes'::interval
          ) AND (
            data_sources_for_media.data_status IS NULL
            OR data_sources_for_media.data_status NOT IN ('ignore')
          )			  
          ORDER BY daily_media.popularity DESC, data_sources_for_media.last_successful_attempt_at ASC, data_sources_for_media.last_attempt_at ASC
          LIMIT $1;
        `
        const { rows } = await pool.query(query.trim(), [batchSize]);

        // If there are no entries to process, wait and try again later
        if (rows.length === 0) {
          await sleep(dataSourceConfig.retryIntervalSeconds * 1000);
          continue;
        }

        // Process each entry in parallel
        await Promise.all(
          rows.map(async (dataSourceRow: { tmdb_id: number, media_type_id: number }) => {
            const tmdbId = dataSourceRow.tmdb_id
            const mediaTypeId = dataSourceRow.media_type_id
            try {
              await dataSource.process(tmdbId, mediaTypeId);
            } catch (error) {
              dataSource.updateStatus({ tmdbId, mediaTypeId, newStatus: 'failed', retryCount: 0, timestamp: new Date(), success: false})
              throw error
            }
          })
        );

        await sleep(dataSourceConfig.batchDelaySeconds * 1000);
      } else {
        try {
          await dataSource.process()
        } catch (error) {
          dataSource.updateStatus({ newStatus: 'failed', retryCount: 0, timestamp: new Date(), success: false })
          throw error
        }

        await sleep(dataSourceConfig.batchDelaySeconds * 1000);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response && error.response.status === 403) {
          // handle rate limit errors by waiting for a configured time
          console.log(`Rate limit reached for ${dataSourceConfig.name}, waiting for ${dataSourceConfig.rateLimitDelaySeconds} seconds`);
          await sleep(dataSourceConfig.rateLimitDelaySeconds * 1000);
        } else {
          // handle connectivity errors by waiting for a configured time
          console.error(`Error processing data source ${dataSourceConfig.name}: ${error.message}`);
          await sleep(dataSourceConfig.batchDelaySeconds * 1000);
        }
      } else {
        await sleep(dataSourceConfig.batchDelaySeconds * 1000);
      }
    }
  }
}
