import { makeAutoObservable } from 'mobx';

export type Theme = 'light' | 'dark';

export class ThemeStore {
  theme: Theme = 'dark';

  constructor() {
    makeAutoObservable(this);
    this.loadThemeFromStorage();
  }

  setTheme(theme: Theme) {
    this.theme = theme;
    this.saveThemeToStorage();
    this.applyTheme();
  }

  toggleTheme() {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  }

  private loadThemeFromStorage() {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      this.theme = savedTheme;
    } else {
      this.theme = 'dark'
    }
    this.applyTheme();
  }

  private saveThemeToStorage() {
    localStorage.setItem('theme', this.theme);
  }

  private applyTheme() {
    if (this.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

export const themeStore = new ThemeStore();