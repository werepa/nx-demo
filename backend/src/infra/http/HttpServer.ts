import { Request, Response } from "express"

export interface RouteHandler {
  (params: any, body?: any): Promise<any>
}

export default interface HttpServer {
  on(
    method: string,
    route: string,
    isProtectedRoute: boolean,
    handler: RouteHandler,
  ): void
  listen(port: number): void
  getApp(): any
}
