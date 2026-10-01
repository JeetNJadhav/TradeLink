interface QuantityStepperProps {
  value: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

const MIN_QUANTITY = 1;

const QuantityStepper = ({
  value,
  max,
  disabled = false,
  onChange,
}: QuantityStepperProps) => (
  <div className="quantity-control">
    <button
      type="button"
      aria-label="Decrease quantity"
      onClick={() => onChange(Math.max(MIN_QUANTITY, value - 1))}
      disabled={disabled || value <= MIN_QUANTITY}
    >
      -
    </button>
    <span aria-live="polite">{value}</span>
    <button
      type="button"
      aria-label="Increase quantity"
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={disabled || value >= max}
    >
      +
    </button>
  </div>
);

export default QuantityStepper;
