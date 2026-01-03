package swf

import (
	"bytes"
	"compress/zlib"
	"encoding/binary"
	"fmt"
	"io"
)

type Reader struct {
	r       io.Reader
	bitBuf  uint8
	bitPos  uint8
}

func NewReader(r io.Reader) *Reader {
	return &Reader{r: r}
}

func (r *Reader) ReadBytes(n int) ([]byte, error) {
	r.AlignByte()
	buf := make([]byte, n)
	_, err := io.ReadFull(r.r, buf)
	return buf, err
}

func (r *Reader) ReadUI8() (uint8, error) {
	r.AlignByte()
	var v uint8
	err := binary.Read(r.r, binary.LittleEndian, &v)
	return v, err
}

func (r *Reader) ReadUI16() (uint16, error) {
	r.AlignByte()
	var v uint16
	err := binary.Read(r.r, binary.LittleEndian, &v)
	return v, err
}

func (r *Reader) ReadUI32() (uint32, error) {
	r.AlignByte()
	var v uint32
	err := binary.Read(r.r, binary.LittleEndian, &v)
	return v, err
}

func (r *Reader) ReadEncodedU32() (uint32, error) {
	r.AlignByte()
	var result uint32
	var shift uint
	for {
		b, err := r.ReadUI8()
		if err != nil {
			return 0, err
		}
		result |= uint32(b&0x7f) << shift
		if b&0x80 == 0 {
			break
		}
		shift += 7
	}
	return result, nil
}

func (r *Reader) ReadString() (string, error) {
	r.AlignByte()
	var buf []byte
	for {
		b, err := r.ReadUI8()
		if err != nil {
			return "", err
		}
		if b == 0 {
			break
		}
		buf = append(buf, b)
	}
	return string(buf), nil
}

func (r *Reader) AlignByte() {
	r.bitPos = 0
	r.bitBuf = 0
}

func (r *Reader) ReadBit() (bool, error) {
	if r.bitPos == 0 {
		var err error
		r.bitBuf, err = r.ReadUI8()
		if err != nil {
			return false, err
		}
		r.bitPos = 8
	}
	r.bitPos--
	val := (r.bitBuf >> r.bitPos) & 1
	return val == 1, nil
}

func (r *Reader) ReadBits(n int) (uint32, error) {
	var val uint32
	for i := 0; i < n; i++ {
		bit, err := r.ReadBit()
		if err != nil {
			return 0, err
		}
		val <<= 1
		if bit {
			val |= 1
		}
	}
	return val, nil
}

func (r *Reader) ReadSBits(n int) (int32, error) {
	val, err := r.ReadBits(n)
	if err != nil {
		return 0, err
	}
	// Sign extension
	shift := 32 - n
	return int32(val<<uint(shift)) >> uint(shift), nil
}

func (r *Reader) ReadRect() (int, int, int, int, error) {
	nbits, err := r.ReadBits(5)
	if err != nil {
		return 0, 0, 0, 0, err
	}
	n := int(nbits)
	xmin, err := r.ReadSBits(n)
	if err != nil { return 0,0,0,0, err }
	xmax, err := r.ReadSBits(n)
	if err != nil { return 0,0,0,0, err }
	ymin, err := r.ReadSBits(n)
	if err != nil { return 0,0,0,0, err }
	ymax, err := r.ReadSBits(n)
	if err != nil { return 0,0,0,0, err }
	
	r.AlignByte()
	
	return int(xmin), int(xmax), int(ymin), int(ymax), nil
}

// UncompressSWF handles the FWS/CWS/ZWS header signature and returns a Reader for the uncompressed body
func UncompressSWF(data []byte) (*Reader, error) {
	if len(data) < 8 {
		return nil, fmt.Errorf("invalid SWF header")
	}
	
	sig := string(data[:3])
	// version := data[3]
	// fileLength := binary.LittleEndian.Uint32(data[4:8])

	var bodyReader io.Reader

	switch sig {
	case "FWS":
		bodyReader = bytes.NewReader(data[8:])
	case "CWS":
		z, err := zlib.NewReader(bytes.NewReader(data[8:]))
		if err != nil {
			return nil, err
		}
		bodyReader = z
	default:
		return nil, fmt.Errorf("unsupported SWF signature: %s", sig)
	}

	return NewReader(bodyReader), nil
}
