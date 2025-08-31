export interface BaseDescriptor<C extends string> {
  code: C; // event.g. 'NOT_FOUND'
  message: string; // human text owned by the service
  service: string; // event.g. 'order-service'
  retryable: boolean; // can caller safely retry?
  httpStatus: number; // suggested mapping for HTTP edges
  v: number; // schema version for this code
}
