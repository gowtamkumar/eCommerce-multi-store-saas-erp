import { EntityManager, Repository } from 'typeorm'

/**
 * Resolves the appropriate repository to use, returning a transactional repository
 * if an active EntityManager is provided, otherwise falling back to the default repository.
 */
export function getTransactionalRepo<T>(
  entity: { new (...args: any[]): T },
  defaultRepo: Repository<T>,
  manager?: EntityManager,
): Repository<T> {
  return manager ? manager.getRepository(entity) : defaultRepo
}
