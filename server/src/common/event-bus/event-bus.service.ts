import { Injectable } from '@nestjs/common'
import { Subject, Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

export interface AppEvent<T = any> {
  type: string
  payload: T
  ctx?: any
}

@Injectable()
export class EventBusService {
  private readonly eventSubject = new Subject<AppEvent>()

  publish<T = any>(event: AppEvent<T>): void {
    this.eventSubject.next(event)
  }

  ofEvent<T = any>(type: string): Observable<AppEvent<T>> {
    return this.eventSubject.asObservable().pipe(
      filter((event) => event.type === type),
      map((event) => event as AppEvent<T>),
    )
  }
}
