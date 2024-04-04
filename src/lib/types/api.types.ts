/** Types wrappers for the API */

import { CreateQueryResult } from '@tanstack/angular-query-experimental';

/** Simple response with data */
export interface SimpleResponse<T> {
  data: T;
}

export interface CreationResponse {
  uid: string;
}

export type QueryType<T> = CreateQueryResult<T, Error>;