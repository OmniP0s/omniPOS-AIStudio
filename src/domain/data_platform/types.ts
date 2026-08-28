export type StorageTier = 'HOT_MEMORY' | 'WARM_LAKEHOUSE' | 'COLD_PARQUET' | 'GLACIER_ARCHIVE';
export type SchemaType = 'STAR_SCHEMA' | 'SNOWFLAKE_SCHEMA';

export interface DataCatalogEntity {
  id: string;
  name: string;
  nameAr: string;
  type: 'FACT' | 'DIMENSION' | 'MATERIALIZED_VIEW' | 'CDC_STREAM' | 'OLAP_CUBE';
  schemaModel: SchemaType;
  storageTier: StorageTier;
  rowCount: string;
  storageSizeMb: number;
  lastUpdated: string;
  scdType?: 'TYPE_0' | 'TYPE_1' | 'TYPE_2';
  descriptionEn: string;
  descriptionAr: string;
  columns: {
    name: string;
    type: string;
    isPrimary?: boolean;
    isForeign?: boolean;
    description: string;
  }[];
}

export interface CdcPipelineStatus {
  id: string;
  sourceTable: string;
  targetLake: string;
  status: 'STREAMING' | 'SYNCED' | 'CATCHING_UP';
  lagMs: number;
  recordsPerSec: number;
  totalEventsProcessed: string;
  connectorType: 'DEBEZIUM_POSTGRES' | 'KAFKA_AVRO' | 'CLICKHOUSE_SINK';
}

export interface OlapCube {
  id: string;
  cubeNameEn: string;
  cubeNameAr: string;
  dimensions: string[];
  measures: string[];
  aggregationCadence: '1_SEC' | '1_MIN' | '1_HOUR' | '1_DAY';
  cacheHitRatio: number;
  queryLatencyP99Ms: number;
}

export interface DataLineageNode {
  id: string;
  label: string;
  category: 'SOURCE_OLTP' | 'CDC_STREAM' | 'BRONZE_LAKE' | 'SILVER_WAREHOUSE' | 'GOLD_MART' | 'BI_DASHBOARD';
  status: 'HEALTHY' | 'SYNCED';
}

export interface ScdRecord {
  surrogateKey: string;
  businessKey: string;
  entityName: string;
  attributeChanged: string;
  oldValue: string;
  newValue: string;
  validFrom: string;
  validTo: string | null;
  isCurrent: boolean;
}
