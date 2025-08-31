import { makeRegistry } from "error-handling/error-core";
import { BaseDescriptor } from "error-handling/error-core";

export const InfraErrorDefs = [
  {
    // UNAVAILABLE — dependency cannot be reached at all.
    // Use when connection fails (ECONNREFUSED/ECONNRESET), DNS/host down, broker/DB offline,
    // healthcheck red, or service discovery says “no instances.”
    // details: { dependency, host?, port?, operation?, attempt? }
    code: 'UNAVAILABLE',
    message: 'Dependency unavailable',
    retryable: true,          // retry with backoff is sensible
    httpStatus: 503,
    v: 1,
    service: 'infra',
  },
  {
    // TIMEOUT — we waited and gave up.
    // Use for client/network timeouts or statement timeouts (event.g., PG 57014), slow HTTP upstreams.
    // details: { dependency, operation?, timeoutMs, attempt?, route?/queryHash? }
    code: 'TIMEOUT',
    message: 'Timeout',
    retryable: true,          // retry may succeed later
    httpStatus: 504,
    v: 1,
    service: 'infra',
  },
  {
    // RATE_LIMITED — throttled by upstream or our own limiter.
    // Use for HTTP 429 or explicit token-bucket refusal.
    // details: { dependency, limit?, remaining?, resetAt?, operation? }
    code: 'RATE_LIMITED',
    message: 'Rate limited',
    retryable: true,          // retry after reset/backoff
    httpStatus: 429,
    v: 1,
    service: 'infra',
  },
  {
    // CIRCUIT_OPEN — breaker tripped locally.
    // Use when your circuit breaker refuses calls to protect the system.
    // details: { dependency, breakerName?, openedAt?, coolDownMs?, failures? }
    code: 'CIRCUIT_OPEN',
    message: 'Circuit breaker open',
    retryable: true,          // retry after cool-down
    httpStatus: 503,
    v: 1,
    service: 'infra',
  },
  {
    // BAD_DEPENDENCY_RESPONSE — upstream responded but the payload is nonsense.
    // Use when you got 2xx/3xx yet JSON/proto is invalid/missing required fields,
    // or schema validation fails while the transport was fine.
    // details: { dependency, status?, bodySnippet?, parseError?, operation? }
    code: 'BAD_DEPENDENCY_RESPONSE',
    message: 'Bad dependency response',
    retryable: false,         // usually needs a fix upstream or contract change
    httpStatus: 502,
    v: 1,
    service: 'infra',
  },
  {
    // INTEGRATION — glue/config/protocol error.
    // Use for auth/signature failures, misconfigured credentials, wrong headers, SDK bugs,
    // version skew in client library, TLS mismatch.
    // details: { dependency, reason, providerCode?, operation?, hint? }
    code: 'INTEGRATION',
    message: 'Integration error',
    retryable: false,         // fix config/code, don’t auto-retry
    httpStatus: 502,
    v: 1,
    service: 'infra',
  },
  {
    // TX_CONFLICT — transactional contention.
    // Use for DB serialization failures / deadlocks (event.g., Postgres 40001/40P01).
    // details: { db?, table?, driverCode?, retryAfterMs?, operation? }
    code: 'TX_CONFLICT',
    message: 'Transaction conflict',
    retryable: true,          // safe to retry the unit of work
    httpStatus: 409,
    v: 1,
    service: 'infra',
  },
  {
    // LOCK_TIMEOUT — could not acquire a lock in time.
    // Use for DB lock timeouts (event.g., Postgres 55P03) or distributed lock timeouts.
    // details: { resource, lockType?, waitedMs?, ownerHint?, operation? }
    code: 'LOCK_TIMEOUT',
    message: 'Lock timeout',
    retryable: true,          // retry after backoff
    httpStatus: 409,
    v: 1,
    service: 'infra',
  },
  {
    // RESOURCE_EXHAUSTED — out of disk/quota/slots.
    // Use for S3/Blob quota exceeded, local disk full, connection pool exhausted beyond policy.
    // details: { resource, quota?, used?, limit?, namespace?, operation? }
    code: 'RESOURCE_EXHAUSTED',
    message: 'Resource exhausted',
    retryable: false,         // not until capacity changes
    httpStatus: 507,
    v: 1,
    service: 'infra',
  },
  {
    // DESERIALIZATION_FAILED — payload cannot be parsed at all.
    // Use for malformed JSON/protobuf/Avro, corrupt Kafka message, base64 errors.
    // details: { source: 'kafka'|'http'|..., topic?/route?, offset?/requestId?, schemaVersion? }
    code: 'DESERIALIZATION_FAILED',
    message: 'Deserialization failed',
    retryable: false,         // send to DLQ; replaying won’t help
    httpStatus: 502,
    v: 1,
    service: 'infra',
  },
  {
    // SCHEMA_MISMATCH — contract/version disagreement detected explicitly.
    // Use when schema registry/ABI says versions don’t match, or migration level
    // is ahead/behind the app (shape changed in a known way).
    // details: { expectedVersion, actualVersion, schemaId?/migration?, component? }
    code: 'SCHEMA_MISMATCH',
    message: 'Schema or contract mismatch',
    retryable: false,         // coordinate a deploy/migration
    httpStatus: 409,
    v: 1,
    service: 'infra',
  },
] as const satisfies readonly BaseDescriptor<string>[];


export const InfraErrorRegistry = makeRegistry('INFRA', InfraErrorDefs);
export const InfraErrorCodes = InfraErrorRegistry.codes;
