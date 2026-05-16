import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { lumina, type Lumina } from '../index.js';
import {
  applyEditingOptions,
  type ImageEditingOptions,
  type LuminaOutputType,
  type LuminaSource,
} from './types.js';

export type LuminaCanvasImage = string | Blob | ImageData | HTMLCanvasElement;

@Component({
  selector: 'lumina-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <canvas
      #canvas
      [class]="canvasClass"
      [ngStyle]="canvasStyle"
      [attr.width]="width ?? null"
      [attr.height]="height ?? null"
    ></canvas>
    @if (errorMessage) {
      <div class="lumina-error">{{ errorMessage }}</div>
    }
  `,
})
export class LuminaCanvasComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild('canvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() source: LuminaSource | null = null;
  @Input() filter?: (chain: Lumina) => Lumina;
  @Input() outputType: LuminaOutputType = 'canvas';
  @Input() width?: number;
  @Input() height?: number;
  @Input() canvasClass?: string;
  @Input() canvasStyle?: Record<string, string | number>;

  @Input() grayscale?: boolean;
  @Input() brightness?: number;
  @Input() contrast?: number;
  @Input() sepia?: boolean;
  @Input() ascii?: boolean | Record<string, unknown>;
  @Input() blur?: number;
  @Input() gaussianBlur?: number;
  @Input() watermark?: { text: string; options?: Record<string, unknown> };
  @Input() backgroundBlur?: Record<string, unknown>;
  @Input() sharpen?: boolean;
  @Input() emboss?: boolean;
  @Input() edgeDetection?: boolean;
  @Input() resize?: { width: number; height: number };
  @Input() crop?: { x: number; y: number; width: number; height: number };

  @Output() processed = new EventEmitter<LuminaCanvasImage>();
  @Output() processError = new EventEmitter<Error>();
  @Output() imageLoad = new EventEmitter<void>();

  errorMessage: string | null = null;
  private viewReady = false;
  private destroyed = false;
  private processVersion = 0;

  ngAfterViewInit(): void {
    this.viewReady = true;
    void this.processImage();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.viewReady) {
      void this.processImage();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.processVersion += 1;
  }

  private get editingOptions(): ImageEditingOptions {
    return {
      grayscale: this.grayscale,
      brightness: this.brightness,
      contrast: this.contrast,
      sepia: this.sepia,
      ascii: this.ascii,
      blur: this.blur,
      gaussianBlur: this.gaussianBlur,
      watermark: this.watermark,
      backgroundBlur: this.backgroundBlur,
      sharpen: this.sharpen,
      emboss: this.emboss,
      edgeDetection: this.edgeDetection,
      resize: this.resize,
      crop: this.crop,
    };
  }

  private async processImage(): Promise<void> {
    if (!this.source || !this.canvasRef) return;

    const version = ++this.processVersion;
    this.errorMessage = null;

    try {
      let chain = lumina(this.source);
      chain = applyEditingOptions(chain, this.editingOptions);

      if (typeof this.filter === 'function') {
        chain = this.filter(chain);
      }

      const canvas = this.canvasRef.nativeElement;
      await chain.toCanvas(canvas);

      if (this.destroyed || version !== this.processVersion) return;

      this.imageLoad.emit();
      this.emitProcessedImage(canvas);
    } catch (err) {
      if (this.destroyed || version !== this.processVersion) return;

      const error = err instanceof Error ? err : new Error(String(err));
      this.errorMessage = error.message;
      this.processError.emit(error);
    }
  }

  private emitProcessedImage(canvas: HTMLCanvasElement): void {
    if (this.outputType === 'dataUrl') {
      this.processed.emit(canvas.toDataURL());
      return;
    }

    if (this.outputType === 'blob') {
      canvas.toBlob((blob) => {
        if (!this.destroyed && blob) this.processed.emit(blob);
      });
      return;
    }

    if (this.outputType === 'imageData') {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        this.processed.emit(
          ctx.getImageData(0, 0, canvas.width, canvas.height),
        );
      }
      return;
    }

    this.processed.emit(canvas);
  }
}
