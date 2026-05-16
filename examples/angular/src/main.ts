import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ImageCropperComponent,
  LuminaCanvasComponent,
} from '@gks101/luminajs/angular';
import {
  type ImageCropperOutput,
  type LuminaCanvasImage,
} from '@gks101/luminajs/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, LuminaCanvasComponent, ImageCropperComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
class AppComponent {
  source = '/sample.png';
  activeTool: 'editor' | 'crop' = 'editor';
  brightness = 0;
  contrast = 0;
  filterType: 'none' | 'grayscale' | 'sepia' | 'blur' | 'sharpen' = 'none';
  dataUrl = '';
  croppedPreview = '';
  status = 'Ready';

  get grayscale(): boolean {
    return this.filterType === 'grayscale';
  }

  get sepia(): boolean {
    return this.filterType === 'sepia';
  }

  get gaussianBlur(): number | undefined {
    return this.filterType === 'blur' ? 5 : undefined;
  }

  get sharpen(): boolean {
    return this.filterType === 'sharpen';
  }

  handleProcessed(image: LuminaCanvasImage): void {
    if (typeof image === 'string') {
      this.dataUrl = image;
      this.status = 'Image processed';
    }
  }

  handleError(error: Error): void {
    this.status = error.message;
  }

  handleCropComplete(output: ImageCropperOutput): void {
    if (typeof output === 'string') {
      this.croppedPreview = output;
      this.status = 'Crop generated';
      return;
    }

    this.croppedPreview = URL.createObjectURL(output);
    this.status = 'Crop generated';
  }

  download(): void {
    const href =
      this.activeTool === 'crop' ? this.croppedPreview : this.dataUrl;
    if (!href) return;

    const link = document.createElement('a');
    link.href = href;
    link.download =
      this.activeTool === 'crop'
        ? 'lumina-angular-crop.png'
        : 'lumina-angular-output.png';
    link.click();
  }
}

bootstrapApplication(AppComponent).catch((error: unknown) => {
  console.error(error);
});
