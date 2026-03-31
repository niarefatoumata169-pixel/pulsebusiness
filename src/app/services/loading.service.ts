import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCounter = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private timeoutId: any = null;
  private timeoutDuration = 10000;
  private timeoutSubject = new Subject<void>();

  show(timeout?: number): void {
    if (this.loadingCounter === 0) {
      this.loadingSubject.next(true);
      if (timeout !== undefined || this.timeoutDuration) {
        const duration = timeout !== undefined ? timeout : this.timeoutDuration;
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
          if (this.loadingCounter > 0) {
            console.warn('LoadingService: timeout reached, forcing hide');
            this.forceHide();
          }
        }, duration);
      }
    }
    this.loadingCounter++;
  }

  hide(): void {
    if (this.loadingCounter > 0) {
      this.loadingCounter--;
    }
    if (this.loadingCounter === 0) {
      this.loadingSubject.next(false);
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }
  }

  forceHide(): void {
    this.loadingCounter = 0;
    this.loadingSubject.next(false);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  setDefaultTimeout(duration: number): void {
    this.timeoutDuration = duration;
  }

  isLoading(): Observable<boolean> {
    return this.loading$;
  }

  async withLoading<T>(task: Promise<T> | Observable<T>, timeout?: number): Promise<T> {
    this.show(timeout);
    try {
      let result: T;
      if (task instanceof Promise) {
        result = await task;
      } else {
        // Use firstValueFrom to get the first emitted value, throws if none.
        result = await firstValueFrom(task.pipe(takeUntil(this.timeoutSubject)));
      }
      this.hide();
      return result;
    } catch (error) {
      this.hide();
      throw error;
    }
  }
}