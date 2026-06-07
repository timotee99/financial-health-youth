import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  getItem<T>(key: string): T | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  removeItem(key: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(key);
  }

  clear(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.clear();
  }

  exportJson(): string {
    const data: Record<string, string> = {};
    if (!isPlatformBrowser(this.platformId)) return '{}';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key) || '';
      }
    }
    return JSON.stringify(data, null, 2);
  }

  importJson(json: string): boolean {
    try {
      const data = JSON.parse(json);
      this.clear();
      for (const key of Object.keys(data)) {
        this.setItem(key, data[key]);
      }
      return true;
    } catch {
      return false;
    }
  }
}
