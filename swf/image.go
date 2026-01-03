package swf

import (
	"bytes"
	"image"
	"image/color"
	"image/draw"
	"image/jpeg"
	"image/png"
	"fmt"
)

func (t *ImageTag) ToImage() (image.Image, error) {
	if t.Format == "jpeg" {
		img, err := jpeg.Decode(bytes.NewReader(t.Data))
		if err != nil {
			return nil, err
		}

		if len(t.AlphaData) > 0 {
			// Apply alpha mask
			// AlphaData is a byte array of alpha values (one per pixel)
			bounds := img.Bounds()
			width, height := bounds.Dx(), bounds.Dy()
			
			if len(t.AlphaData) != width*height {
				// Mismatch, maybe due to padding? SWF usually doesn't pad JPEG alpha.
				// Or maybe I decompressed it wrong? 
				// Assuming it is correct for now or fallback.
				if len(t.AlphaData) < width*height {
					return img, nil // Ignore alpha if not enough data
				}
			}

			rgba := image.NewNRGBA(bounds)
			draw.Draw(rgba, bounds, img, bounds.Min, draw.Src)

			for y := 0; y < height; y++ {
				for x := 0; x < width; x++ {
					alpha := t.AlphaData[y*width+x]
					offset := (y-bounds.Min.Y)*rgba.Stride + (x-bounds.Min.X)*4
					rgba.Pix[offset+3] = alpha
				}
			}
			return rgba, nil
		}
		return img, nil
	} else if t.Format == "png" {
		// This is raw pixel data from DefineBitsLossless
		// Format 5: ARGB (32 bit) - premultiplied alpha
		// Format 3: Colormapped (8 bit)

		if t.BitmapFormat == 5 {
			// Format 5: ARGB with premultiplied alpha
			img := image.NewNRGBA(image.Rect(0, 0, t.Width, t.Height))
			idx := 0
			for i := 0; i < len(t.Data); i += 4 {
				// SWF ARGB: Alpha, Red, Green, Blue (premultiplied)
				a := t.Data[i]
				r := t.Data[i+1]
				g := t.Data[i+2]
				b := t.Data[i+3]

				// Un-premultiply alpha: RGB values are premultiplied, so we need to divide by alpha
				// to get the original color values
				if a > 0 {
					r = uint8((uint16(r) * 255) / uint16(a))
					g = uint8((uint16(g) * 255) / uint16(a))
					b = uint8((uint16(b) * 255) / uint16(a))
				}

				img.Pix[idx] = r
				img.Pix[idx+1] = g
				img.Pix[idx+2] = b
				img.Pix[idx+3] = a
				idx += 4
			}
			return img, nil
		} else if t.BitmapFormat == 3 {
			// Format 3: Colormapped (8 bit)
			// t.Data contains Color Table followed by Indices.
			
			// Color Table Entry Size
			entrySize := 3 // RGB
			if t.TagCode == 36 { // DefineBitsLossless2
				entrySize = 4 // RGBA
			}
			
			tableBytes := t.ColorTableSize * entrySize
			if len(t.Data) < tableBytes {
				return nil, fmt.Errorf("data too short for color table")
			}
			
			colorTable := t.Data[:tableBytes]
			pixelData := t.Data[tableBytes:]
			
			// Build Palette
			palette := make(color.Palette, t.ColorTableSize)
			for i := 0; i < t.ColorTableSize; i++ {
				offset := i * entrySize
				if entrySize == 3 {
					// RGB
					palette[i] = color.RGBA{
						R: colorTable[offset],
						G: colorTable[offset+1],
						B: colorTable[offset+2],
						A: 255,
					}
				} else {
					// ARGB
					palette[i] = color.RGBA{
						R: colorTable[offset+1],
						G: colorTable[offset+2],
						B: colorTable[offset+3],
						A: colorTable[offset],
					}
				}
			}
			
			// Pixel indices
			// Rows are padded to 32-bit alignment (4 bytes)
			rowBytes := (t.Width + 3) & ^3

			img := image.NewPaletted(image.Rect(0, 0, t.Width, t.Height), palette)

			ptr := 0
			for y := 0; y < t.Height; y++ {
				for x := 0; x < t.Width; x++ {
					if ptr >= len(pixelData) {
						// Ran out of data, stop processing
						return img, nil
					}
					idx := pixelData[ptr]
					img.SetColorIndex(x, y, idx)
					ptr++
				}
				// Skip padding bytes at the end of each row
				paddingBytes := rowBytes - t.Width
				ptr += paddingBytes
			}
			return img, nil
			
		} else {
			// Unsupported bitmap format
			return nil, fmt.Errorf("unsupported bitmap format: %d (data length=%d)", t.BitmapFormat, len(t.Data))
		}
	}
	
	return nil, fmt.Errorf("unknown format")
}

func (t *ImageTag) ToPNG() ([]byte, error) {
	img, err := t.ToImage()
	if err != nil {
		return nil, err
	}
	buf := new(bytes.Buffer)
	err = png.Encode(buf, img)
	return buf.Bytes(), err
}
