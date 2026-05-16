import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { lumina } from '../index.js';
import { LuminaCanvasComponent } from './LuminaCanvas.component';
import {
  CropArea,
  ImageAreaSelectorComponent,
} from './ImageAreaSelector.component';
import { type LuminaSource } from './types.js';

export type ImageCropperOutput = Blob | string;

@Component({
  selector: 'lumina-image-cropper',
  standalone: true,
  imports: [CommonModule, ImageAreaSelectorComponent, LuminaCanvasComponent],
  template: `
    <div class="lumina-image-cropper" [ngStyle]="containerStyle">
      <div
        class="crop-frame"
        [style.max-width.px]="maxWidth"
        [style.max-height.px]="maxHeight"
      >
        @if (appliedPreviewSrc) {
          <lumina-canvas
            [source]="appliedPreviewSrc"
            [canvasStyle]="{ width: '100%', height: '100%', display: 'block' }"
            (processError)="processError.emit($event)"
          ></lumina-canvas>
        } @else if (imageSrc) {
          <lumina-image-area-selector
            #selector
            [src]="imageSrc"
            [aspect]="aspectRatio"
            [lineColor]="lineColor"
            [overlayOpacity]="overlayOpacity"
            [showControls]="true"
            (cropChange)="handleCropChange($event)"
            (cropComplete)="handleCropComplete($event)"
          >
            <div luminaAreaControls class="crop-actions">
              <button
                type="button"
                class="apply"
                [disabled]="isCropping"
                (click)="applyCrop()"
              >
                {{ isCropping ? 'Processing...' : 'Apply Crop' }}
              </button>

              @if (allowReset) {
                <button
                  type="button"
                  class="reset"
                  [disabled]="isCropping"
                  (click)="reset()"
                >
                  Reset
                </button>
              }
            </div>
          </lumina-image-area-selector>
        }

        @if (isCropping) {
          <div class="processing">Processing...</div>
        }

        @if (allowReset && appliedPreviewSrc && !isCropping) {
          <div class="preview-actions" [ngClass]="buttonPosition">
            <button type="button" class="reset" (click)="reset()">Reset</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .lumina-image-cropper {
        padding: 16px;
        border-radius: 8px;
      }

      .crop-frame {
        position: relative;
        overflow: hidden;
        border: 1px solid #d8dde6;
        border-radius: 6px;
        background: #f6f7f9;
      }

      .crop-actions,
      .preview-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .preview-actions {
        position: absolute;
        z-index: 1001;
      }

      .top-left {
        top: 12px;
        left: 12px;
      }

      .top-right {
        top: 12px;
        right: 12px;
      }

      .top-center {
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
      }

      .bottom-left {
        bottom: 12px;
        left: 12px;
      }

      .bottom-center {
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
      }

      .bottom-right {
        right: 12px;
        bottom: 12px;
      }

      button {
        min-height: 36px;
        padding: 0 12px;
        border: 1px solid #c9d2df;
        border-radius: 4px;
        background: #ffffff;
        color: #17202a;
        font: inherit;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      button.apply {
        border-color: #0066cc;
        background: #0066cc;
        color: #ffffff;
      }

      .processing {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        background: rgba(255, 255, 255, 0.75);
        color: #17202a;
        font-size: 14px;
        font-weight: 700;
        z-index: 1100;
      }
    `,
  ],
})
export class ImageCropperComponent implements OnChanges, OnDestroy {
  @ViewChild('selector') private selector?: ImageAreaSelectorComponent;

  @Input() src: LuminaSource | null = null;
  @Input() aspectRatio?: number;
  @Input() outputFormat: 'blob' | 'dataUrl' = 'blob';
  @Input() maxWidth = 600;
  @Input() maxHeight = 400;
  @Input() allowReset = true;
  @Input() lineColor = '#0066cc';
  @Input() overlayOpacity = 0.6;
  @Input() buttonPosition:
    | 'top-left'
    | 'top-right'
    | 'top-center'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right' = 'top-left';
  @Input() containerStyle?: Record<string, string | number>;

  @Output() cropChange = new EventEmitter<CropArea>();
  @Output() cropSelectionComplete = new EventEmitter<CropArea>();
  @Output() cropComplete = new EventEmitter<ImageCropperOutput>();
  @Output() processError = new EventEmitter<Error>();
  @Output() resetCrop = new EventEmitter<void>();

  imageSrc?: string;
  appliedPreviewSrc: string | null = null;
  isCropping = false;
  private selectedCrop: CropArea | null = null;
  private objectUrls = new Set<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src']) {
      this.revokeGeneratedUrls();
      this.selectedCrop = null;
      this.appliedPreviewSrc = null;
      this.imageSrc = this.resolveImageSrc(this.src);
    }
  }

  ngOnDestroy(): void {
    this.revokeGeneratedUrls();
  }

  handleCropChange(crop: CropArea): void {
    this.selectedCrop = crop;
    this.appliedPreviewSrc = null;
    this.cropChange.emit(crop);
  }

  handleCropComplete(crop: CropArea): void {
    this.selectedCrop = crop;
    this.cropSelectionComplete.emit(crop);
  }

  async applyCrop(): Promise<void> {
    if (
      !this.selectedCrop ||
      this.selectedCrop.width === 0 ||
      this.selectedCrop.height === 0
    ) {
      this.processError.emit(new Error('Please select a crop area'));
      return;
    }

    if (!this.src) {
      this.processError.emit(new Error('No source image provided'));
      return;
    }

    this.isCropping = true;

    try {
      const crop = this.selectedCrop;
      const chain = lumina(this.src).crop(
        crop.x,
        crop.y,
        crop.width,
        crop.height,
      );

      if (this.outputFormat === 'dataUrl') {
        const dataUrl = await chain.toDataURL();
        this.appliedPreviewSrc = dataUrl;
        this.cropComplete.emit(dataUrl);
      } else {
        const blob = await chain.toBlob();
        const previewUrl = URL.createObjectURL(blob);
        this.objectUrls.add(previewUrl);
        this.appliedPreviewSrc = previewUrl;
        this.cropComplete.emit(blob);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.processError.emit(error);
    } finally {
      this.isCropping = false;
    }
  }

  reset(): void {
    this.selectedCrop = null;
    this.appliedPreviewSrc = null;
    this.selector?.reset();
    this.resetCrop.emit();
  }

  private resolveImageSrc(src: LuminaSource | null): string | undefined {
    if (typeof src === 'string') return src;

    if (src instanceof File) {
      const url = URL.createObjectURL(src);
      this.objectUrls.add(url);
      return url;
    }

    return undefined;
  }

  private revokeGeneratedUrls(): void {
    for (const url of this.objectUrls) {
      URL.revokeObjectURL(url);
    }
    this.objectUrls.clear();
  }
}
