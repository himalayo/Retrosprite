package swf

import (
	"bytes"
	"compress/zlib"
	"fmt"
	"io"
)

type TagHeader struct {
	Code   uint16
	Length int
}

type Tag interface{}

type SymbolClassTag struct {
	Symbols []Symbol
}

type Symbol struct {
	ID   uint16
	Name string
}

type DefineBinaryDataTag struct {
	TagID uint16
	Data  []byte
}

type ImageTag struct {
	TagCode     uint16
	CharacterID uint16
	Format      string // "jpeg", "png" (lossless)
	BitmapFormat uint8
	ColorTableSize int
	Data        []byte
	AlphaData   []byte // For JPEG3/4
	Width       int
	Height      int
}

func (r *Reader) ReadTagHeader() (*TagHeader, error) {
	r.AlignByte()
	codeAndLength, err := r.ReadUI16()
	if err != nil {
		return nil, err
	}
	code := codeAndLength >> 6
	length := int(codeAndLength & 0x3F)

	if length == 0x3F {
		l, err := r.ReadUI32()
		if err != nil {
			return nil, err
		}
		length = int(l)
	}

	return &TagHeader{Code: code, Length: length}, nil
}

func ReadTags(r *Reader) ([]Tag, error) {
	var tags []Tag

	// Skip FrameSize (Rect)
	_, _, _, _, err := r.ReadRect()
	if err != nil {
		return nil, fmt.Errorf("failed to read FrameSize: %w", err)
	}
	
	// Skip FrameRate
	_, err = r.ReadUI16() 
	if err != nil { return nil, fmt.Errorf("failed to read FrameRate: %w", err) }

	// Skip FrameCount
	_, err = r.ReadUI16()
	if err != nil { return nil, fmt.Errorf("failed to read FrameCount: %w", err) }


	for {
		header, err := r.ReadTagHeader()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}

		if header.Code == 0 { // End Tag
			break
		}
		
		tagData, err := r.ReadBytes(header.Length)
		if err != nil {
			return nil, fmt.Errorf("failed to read tag body for code %d: %w", header.Code, err)
		}
		
		tagReader := NewReader(bytes.NewReader(tagData))

		switch header.Code {
		case 76: // SymbolClass
			t, err := readSymbolClass(tagReader)
			if err != nil { return nil, err }
			tags = append(tags, t)
		case 87: // DefineBinaryData
			t, err := readDefineBinaryData(tagReader)
			if err != nil { return nil, err }
			tags = append(tags, t)
		case 20, 36: // DefineBitsLossless, DefineBitsLossless2
			t, err := readDefineBitsLossless(tagReader, header.Code)
			if err != nil { return nil, err }
			tags = append(tags, t)
		case 21, 35: // DefineBitsJPEG2, DefineBitsJPEG3
			t, err := readDefineBitsJPEG(tagReader, header.Code, header.Length)
			if err != nil { return nil, err }
			tags = append(tags, t)
		}
	}

	return tags, nil
}

func readSymbolClass(r *Reader) (*SymbolClassTag, error) {
	numSymbols, err := r.ReadUI16()
	if err != nil {
		return nil, err
	}
	t := &SymbolClassTag{}
	for i := 0; i < int(numSymbols); i++ {
		id, err := r.ReadUI16()
		if err != nil { return nil, err }
		name, err := r.ReadString()
		if err != nil { return nil, err }
		t.Symbols = append(t.Symbols, Symbol{ID: id, Name: name})
	}
	return t, nil
}

func readDefineBinaryData(r *Reader) (*DefineBinaryDataTag, error) {
	tagID, err := r.ReadUI16()
	if err != nil { return nil, err }
	
	// Reserved UI32
	_, err = r.ReadUI32()
	if err != nil { return nil, err }
	
	// Remaining is data
	data, err := io.ReadAll(r.r)
	if err != nil { return nil, err }
	
	return &DefineBinaryDataTag{TagID: tagID, Data: data}, nil
}

func readDefineBitsLossless(r *Reader, code uint16) (*ImageTag, error) {
	charID, err := r.ReadUI16()
	if err != nil { return nil, err }
	
	format, err := r.ReadUI8()
	if err != nil { return nil, err }
	
	width, err := r.ReadUI16()
	if err != nil { return nil, err }
	
	height, err := r.ReadUI16()
	if err != nil { return nil, err }
	
	var colorTableSize int
	if format == 3 {
		// color table size UI8
		cts, err := r.ReadUI8()
		if err != nil { return nil, err }
		colorTableSize = int(cts) + 1
	}
	
	// ZlibBitmapData
	// We read all remaining to get zlib data
	zlibData, err := io.ReadAll(r.r)
	if err != nil { return nil, err }
	
	// Decompress
	zReader, err := zlib.NewReader(bytes.NewReader(zlibData))
	if err != nil { return nil, fmt.Errorf("zlib error: %w", err) }
	defer zReader.Close()
	
	decompressed, err := io.ReadAll(zReader)
	if err != nil { return nil, err }

	return &ImageTag{
		TagCode:     code,
		CharacterID: charID,
		Format:      "png", // Treated as lossless/png
		BitmapFormat: format,
		ColorTableSize: colorTableSize,
		Data:        decompressed,
		Width:       int(width),
		Height:      int(height),
	}, nil
}

func readDefineBitsJPEG(r *Reader, code uint16, length int) (*ImageTag, error) {
	charID, err := r.ReadUI16()
	if err != nil { return nil, err }
	
	if code == 21 { // JPEG2
		data, err := io.ReadAll(r.r)
		if err != nil { return nil, err }
		return &ImageTag{CharacterID: charID, Format: "jpeg", Data: data}, nil
	}
	
	if code == 35 { // JPEG3
		alphaOffset, err := r.ReadUI32()
		if err != nil { return nil, err }
		
		// The alphaOffset is relative to the beginning of the tag data?
		// "The encoding of the AlphaDataOffset field is the same as the encoding of a UI32 field, but the value is the offset to the AlphaData field."
		// Offset from the beginning of the tag body (after Header).
		// We have already read charID (2 bytes) and alphaOffset (4 bytes) = 6 bytes.
		
		// Actually typical doc says "Count of bytes in JPEGData".
		
		jpegLen := int(alphaOffset)
		jpegData, err := r.ReadBytes(jpegLen)
		if err != nil { return nil, err }
		
		alphaData, err := io.ReadAll(r.r)
		if err != nil { return nil, err }
		
		// Decompress alpha
		zReader, err := zlib.NewReader(bytes.NewReader(alphaData))
		if err != nil { return nil, err }
		defer zReader.Close()
		
		decompressedAlpha, err := io.ReadAll(zReader)
		if err != nil { return nil, err }

		return &ImageTag{
			CharacterID: charID,
			Format:      "jpeg",
			Data:        jpegData,
			AlphaData:   decompressedAlpha,
		}, nil
	}
	
	return nil, fmt.Errorf("unsupported JPEG tag code: %d", code)
}
