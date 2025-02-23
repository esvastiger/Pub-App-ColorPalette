import { RouterOutlet } from '@angular/router';

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';

import $ from 'jquery';

interface ColorHistory {
  color: string;
  timestamp: Date;
}


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'COLORPALETTE';

  selectedColor: string = '#ff0000';
  complementaryColors: string[] = [];
  contrastingColors: string[] = [];
  colorPalette: string[] = [];
  colorHistory1: ColorHistory[] = [];

  ngOnInit() {
    this.loadHistory();
    this.updateColors();
  }

  loadHistory() {
    const savedHistory = localStorage.getItem('colorHistory1');
      if (savedHistory) {
        this.colorHistory1 = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
  }

  saveHistory() {
    localStorage.setItem('colorHistory1', JSON.stringify(this.colorHistory1));
  }

  generateRandomColor() {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    this.selectedColor = randomColor;
    this.updateColors();
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Color copiado al portapapeles!');
    }).catch(err => {
      console.error('Error al copiar:', err);
    });
  }

  updateColors() {
    this.addToHistory(this.selectedColor);
    this.generateComplementaryColors();
    this.generateContrastingColors();
    this.generateColorPalette();
  }

  addToHistory(color: string) {
      this.colorHistory1.unshift({
        color,
        timestamp: new Date()
      });

    if (this.colorHistory1.length > 10 ) {
      this.colorHistory1.pop();
    }

    this.saveHistory();
  }

  generateComplementaryColors() {
    const hsl = this.hexToHSL(this.selectedColor);
    const comp1 = (hsl.h + 180) % 360;
    const comp2 = (hsl.h + 150) % 360;

    this.complementaryColors = [
      this.HSLToHex(comp1, hsl.s, hsl.l),
      this.HSLToHex(comp2, hsl.s, hsl.l)
    ];
  }

  generateContrastingColors() {
    const hsl = this.hexToHSL(this.selectedColor);
    const contrast1 = (hsl.h + 90) % 360;
    const contrast2 = (hsl.h + 270) % 360;

    this.contrastingColors = [
      this.HSLToHex(contrast1, hsl.s, hsl.l),
      this.HSLToHex(contrast2, hsl.s, hsl.l)
    ];
  }

  generateColorPalette() {
    const hsl = this.hexToHSL(this.selectedColor);
    this.colorPalette = [
      this.HSLToHex(hsl.h, hsl.s, hsl.l * 0.8),
      this.HSLToHex(hsl.h, hsl.s * 0.8, hsl.l),
      this.HSLToHex(hsl.h, hsl.s, hsl.l),
      this.HSLToHex(hsl.h, Math.min(hsl.s * 1.2, 100), hsl.l),
      this.HSLToHex(hsl.h, hsl.s, Math.min(hsl.l * 1.2, 100))
    ];
  }

  hexToHSL(hex: string): { h: number; s: number; l: number } {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  HSLToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');


    return `#${rHex}${gHex}${bHex}`;
  }

}
