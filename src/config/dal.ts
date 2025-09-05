import { BadException, NotFoundError } from "../error/ErrorTypes";
import pool from "./db";

export interface DAL {
  any(query: string, params: []): Promise<any | BadException>;
  None(query: string, params: []): Promise<null | BadException>;
  One(query: string, params: []): Promise<any | BadException | NotFoundError>;
  OneOrMany(
    query: string,
    params: [string]
  ): Promise<any | BadException | NotFoundError>;
}

export class dalImpl implements DAL {
  async any(query: string, params: []): Promise<any | BadException> {
    const { rows } = await pool.query(query, params);
    if (!rows) {
      return new BadException("Error accessing data");
    }
    return rows;
  }
  async None(query: string, params: []): Promise<null | BadException> {
    const { rows } = await pool.query(query, params);
    if (rows.length > 0) {
      return new BadException(`Expected no rows but got ${rows.length} rows`);
    }
    return null;
  }
  async One(
    query: string,
    params: []
  ): Promise<any | BadException | NotFoundError> {
    const { rows } = await pool.query(query, params);
    if (rows.length === 0) {
      return new NotFoundError("Expected one row but got none");
    }
    if (rows.length > 1) {
      return new BadException("Got more errors than expected");
    }

    return rows[0];
  }
  async OneOrMany(
    query: string,
    params: [string]
  ): Promise<any | BadException | NotFoundError> {
    const { rows } = await pool.query(query, params);
    if (rows.length === 0) {
      return new NotFoundError("Expected at least one row, got none");
    }
    return rows;
  }
}

const dal = new dalImpl();
export default dal;
