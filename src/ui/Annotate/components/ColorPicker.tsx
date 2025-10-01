interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="protobooth-color-picker" data-testid="color-picker">
      <button
        data-testid="color-red"
        data-selected={selectedColor === '#ff0000'}
        onClick={() => onColorChange('#ff0000')}
        style={{ backgroundColor: '#ff0000' }}
      />
      <button
        data-testid="color-blue"
        data-selected={selectedColor === '#0000ff'}
        onClick={() => onColorChange('#0000ff')}
        style={{ backgroundColor: '#0000ff' }}
      />
    </div>
  );
}
