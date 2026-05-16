import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type DragMode = 'draw' | 'move';

interface ImagePoint {
  x: number;
  y: number;
  imageWidth: number;
  imageHeight: number;
}

@Component({
  selector: 'lumina-image-area-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="lumina-area-selector"
      [class.is-moving]="isDragging && dragMode === 'move'"
      (mousedown)="handleMouseDown($event)"
      (mousemove)="handleMouseMove($event)"
      (mouseup)="stopDragging()"
      (mouseleave)="stopDragging()"
    >
      <img
        #image
        [src]="src"
        [alt]="alt"
        draggable="false"
        (load)="updateDisplayScale()"
      />

      @if (crop.width > 0 && crop.height > 0) {
        <div class="selection" [ngStyle]="selectionStyle"></div>

        @if (showControls) {
          <div
            class="selection-controls"
            [ngStyle]="controlsStyle"
            (mousedown)="$event.stopPropagation()"
            (mouseup)="$event.stopPropagation()"
            (click)="$event.stopPropagation()"
          >
            <ng-content select="[luminaAreaControls]"></ng-content>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .lumina-area-selector {
        position: relative;
        display: inline-block;
        max-width: 100%;
        cursor: crosshair;
        user-select: none;
        overflow: hidden;
      }

      .lumina-area-selector.is-moving {
        cursor: grabbing;
      }

      img {
        display: block;
        max-width: 100%;
        user-select: none;
      }

      .selection {
        position: absolute;
        background: rgba(255, 255, 255, 0.1);
        cursor: move;
        z-index: 10;
        box-sizing: border-box;
      }

      .selection-controls {
        position: absolute;
        z-index: 1001;
        pointer-events: auto;
      }
    `,
  ],
})
export class ImageAreaSelectorComponent {
  @ViewChild('image', { static: true })
  private imageRef!: ElementRef<HTMLImageElement>;

  @Input({ required: true }) src = '';
  @Input() alt = 'Crop source';
  @Input() aspect?: number;
  @Input() lineWidth = 2;
  @Input() lineColor = '#0066cc';
  @Input() overlayOpacity = 0.6;
  @Input() showControls = false;

  @Output() cropChange = new EventEmitter<CropArea>();
  @Output() cropComplete = new EventEmitter<CropArea>();

  crop: CropArea = { x: 0, y: 0, width: 0, height: 0 };
  isDragging = false;
  dragMode: DragMode = 'draw';
  displayScale = { scaleX: 1, scaleY: 1 };
  private startPos = { x: 0, y: 0 };
  private moveOffset = { x: 0, y: 0 };

  get selectionStyle(): Record<string, string> {
    return {
      left: `${this.crop.x * this.displayScale.scaleX}px`,
      top: `${this.crop.y * this.displayScale.scaleY}px`,
      width: `${this.crop.width * this.displayScale.scaleX}px`,
      height: `${this.crop.height * this.displayScale.scaleY}px`,
      border: `${this.lineWidth}px dashed ${this.lineColor}`,
      boxShadow: `0 0 0 9999px rgba(0, 0, 0, ${this.overlayOpacity})`,
    };
  }

  get controlsStyle(): Record<string, string> {
    const left = this.crop.x * this.displayScale.scaleX;
    const top = this.crop.y * this.displayScale.scaleY;
    const height = this.crop.height * this.displayScale.scaleY;
    const controlHeight = 40;
    let controlsTop = top - controlHeight - 8;

    if (controlsTop < 8) {
      controlsTop = top + height + 8;
    }

    return {
      left: `${left}px`,
      top: `${controlsTop}px`,
    };
  }

  @HostListener('window:resize')
  updateDisplayScale(): void {
    const img = this.imageRef?.nativeElement;
    if (!img || img.naturalWidth === 0 || img.naturalHeight === 0) return;

    const rect = img.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    this.displayScale = {
      scaleX: rect.width / img.naturalWidth,
      scaleY: rect.height / img.naturalHeight,
    };
  }

  handleMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return;

    const point = this.getImagePoint(event);
    if (!point) return;

    this.isDragging = true;

    const insideCrop =
      this.crop.width > 0 &&
      this.crop.height > 0 &&
      point.x >= this.crop.x &&
      point.x <= this.crop.x + this.crop.width &&
      point.y >= this.crop.y &&
      point.y <= this.crop.y + this.crop.height;

    if (insideCrop) {
      this.dragMode = 'move';
      this.moveOffset = {
        x: point.x - this.crop.x,
        y: point.y - this.crop.y,
      };
      return;
    }

    this.dragMode = 'draw';
    this.startPos = { x: point.x, y: point.y };
    this.crop = { x: point.x, y: point.y, width: 0, height: 0 };
  }

  handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    const point = this.getImagePoint(event);
    if (!point) return;

    if (this.dragMode === 'move') {
      this.crop = {
        ...this.crop,
        x: Math.max(
          0,
          Math.min(
            point.x - this.moveOffset.x,
            point.imageWidth - this.crop.width,
          ),
        ),
        y: Math.max(
          0,
          Math.min(
            point.y - this.moveOffset.y,
            point.imageHeight - this.crop.height,
          ),
        ),
      };
      this.cropChange.emit(this.crop);
      return;
    }

    let width = point.x - this.startPos.x;
    let height = this.aspect ? width / this.aspect : point.y - this.startPos.y;

    if (this.aspect && Math.abs(height) > 0) {
      const maxHeight = point.imageHeight - Math.max(0, this.startPos.y);
      const maxWidth = point.imageWidth - Math.max(0, this.startPos.x);

      if (Math.abs(height) > maxHeight) {
        height = Math.sign(height) * maxHeight;
        width = height * this.aspect;
      }
      if (Math.abs(width) > maxWidth) {
        width = Math.sign(width) * maxWidth;
        height = width / this.aspect;
      }
    }

    this.crop = {
      x: width > 0 ? this.startPos.x : point.x,
      y: height > 0 ? this.startPos.y : point.y,
      width: Math.abs(width),
      height: Math.abs(height),
    };
    this.cropChange.emit(this.crop);
  }

  stopDragging(): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    if (this.crop.width > 0 && this.crop.height > 0) {
      this.cropComplete.emit(this.crop);
    }
  }

  reset(): void {
    this.crop = { x: 0, y: 0, width: 0, height: 0 };
  }

  private getImagePoint(event: MouseEvent): ImagePoint | null {
    const img = this.imageRef?.nativeElement;
    const rect = img?.getBoundingClientRect();
    if (!rect || !img) return null;

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    return {
      x: Math.max(
        0,
        Math.min((event.clientX - rect.left) * scaleX, img.naturalWidth),
      ),
      y: Math.max(
        0,
        Math.min((event.clientY - rect.top) * scaleY, img.naturalHeight),
      ),
      imageWidth: img.naturalWidth,
      imageHeight: img.naturalHeight,
    };
  }
}
