import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 


type Slide = { url: string; name: string };

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule,FormsModule],
  styles: [`
    :host { display:block; height:100dvh; }
    /* evita selección accidental al presentar */
    .noselect { -webkit-user-select:none; -ms-user-select:none; user-select:none; }
  `],
  template: `
  <div class="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
    <!-- Top bar -->
    <header class="flex items-center justify-between gap-2 p-4 border-b border-white/10">
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-semibold tracking-tight">My Favorite Food · <span class="opacity-90">Mashed Potatoes with Beef (Puré de papa con carne)</span></h1>
        <span class="px-2 py-0.5 text-xs rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">Presentación</span>
      </div>

      <div class="flex items-center gap-2">
        <!-- File input (oculto) -->
        <input id="file" class="hidden" type="file" accept="image/*" multiple (change)="onFilesSelected($event)">
        <label for="file"
               class="cursor-pointer px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15">
          Subir imágenes
        </label>

        <button (click)="loadDemo()" class="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15">
          Demo
        </button>

        <button (click)="toggle()" class="px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600">
          {{ isPlaying ? 'Pausar' : 'Reproducir' }}
        </button>

        <button (click)="prev()" class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15">‹</button>
        <button (click)="next()" class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15">›</button>

        <button (click)="toggleFull()" class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15">Pantalla completa</button>

        <div class="flex items-center gap-2 ml-2">
          <span class="text-xs opacity-70">Vel.</span>
          <input type="range" min="800" max="6000" step="200" [(ngModel)]="intervalMs"
                 class="w-32 accent-indigo-500 bg-transparent">
        </div>
      </div>
    </header>

    <!-- Stage -->
    <main class="h-[calc(100%-112px)] md:h-[calc(100%-96px)] flex items-center justify-center p-4 md:p-6 noselect"
          (click)="toggle()" title="Click: play/pause · ←/→: anterior/siguiente · Space: play/pause · F: pantalla completa">
      <div class="relative w-[92vw] md:w-[80vw] max-w-4xl md:max-w-5xl aspect-video
            rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10
            bg-black/30 p-4 md:p-8">
        <!-- Slides -->
        <ng-container *ngFor="let s of images; let i = index">
          <img [src]="s.url" [alt]="s.name"
            class="absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ease-in-out"
            [style.opacity]="i === current ? 1 : 0">
        </ng-container>

        <!-- Overlay title -->
        <div class="absolute top-0 left-0 right-0 p-4 md:p-6 pointer-events-none">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur bg-black/35 ring-1 ring-white/10">
            <span class="text-sm md:text-base font-medium">Puré de papa · Mashed Potatoes</span>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="absolute bottom-0 left-0 right-0 h-1.5 bg-white/15">
          <div class="h-full bg-indigo-500 transition-all duration-500"
               [style.width.%]="images.length ? ((current+1)/images.length)*100 : 0"></div>
        </div>

        <!-- Hint -->
        <div *ngIf="!isPlaying" class="absolute inset-0 grid place-items-center text-center">
          <div class="px-4 py-3 rounded-xl bg-black/50 backdrop-blur ring-1 ring-white/10">
            <p class="text-sm opacity-90">Sube imágenes o presiona <span class="font-semibold">Demo</span>.</p>
            <p class="text-xs opacity-70">Click o barra espaciadora para reproducir.</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer: contador -->
    <footer class="h-16 px-4 md:px-6 flex items-center justify-between text-sm text-white/80 border-t border-white/10">
      <div>Imágenes: <span class="font-semibold">{{ images.length }}</span></div>
      <div *ngIf="images.length">Mostrando <span class="font-semibold">{{ current+1 }}</span> / {{ images.length }}</div>
      <div>Atajos: <span class="opacity-70">Espacio</span>, <span class="opacity-70">←/→</span>, <span class="opacity-70">F</span></div>
    </footer>
  </div>
  `
})
export class App implements OnDestroy {
  images: Slide[] = [];
  current = 0;
  isPlaying = false;
  intervalMs = 2500;
  private timer?: any;

  onFilesSelected(ev: Event) {
    const files = (ev.target as HTMLInputElement).files;
    if (!files) return;
    this.clearImages();
    for (const f of Array.from(files)) {
      if (f.type.startsWith('image/')) {
        this.images.push({ url: URL.createObjectURL(f), name: f.name });
      }
    }
    this.current = 0;
  }

  loadDemo() {
    this.clearImages();
    const files = [
      'imagen-1.webp', 'imagen-2.webp','imagen-3.webp','imagen-4.webp','imagen-5.webp',
      'imagen-6.webp','imagen-7.webp'
    ];
    this.images = files.map(name => ({
      url: `assets/demo/${name}`,
      name
    }));
    this.current = 0;
  }

  toggle() { this.isPlaying ? this.pause() : this.play(); }
  play() {
    if (!this.images.length) return;
    this.isPlaying = true;
    this.pause(); // por si existe
    this.timer = setInterval(() => this.next(), this.intervalMs);
  }
  pause() { if (this.timer) clearInterval(this.timer); this.timer = undefined; this.isPlaying = false; }

  next() { if (this.images.length) this.current = (this.current + 1) % this.images.length; }
  prev() { if (this.images.length) this.current = (this.current - 1 + this.images.length) % this.images.length; }

  // Atajos de teclado
  constructor() {
    window.addEventListener('keydown', this.keyHandler);
  }
  keyHandler = (e: KeyboardEvent) => {
    if (e.key === ' ') { e.preventDefault(); this.toggle(); }
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key.toLowerCase() === 'f') this.toggleFull();
  };

  toggleFull() {
    const el: any = document.fullscreenElement ? document : document.documentElement;
    if (!document.fullscreenElement) (document.documentElement as any).requestFullscreen?.();
    else (el as any).exitFullscreen?.();
  }

  private clearImages() {
    for (const s of this.images) {
      if (s.url.startsWith('blob:')) URL.revokeObjectURL(s.url);
    }
    this.images = [];
    this.pause();
  }

  ngOnDestroy() {
    window.removeEventListener('keydown', this.keyHandler);
    this.clearImages();
  }
}