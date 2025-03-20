export interface UseCase {
  execute(dto?: any): Promise<any>
}
