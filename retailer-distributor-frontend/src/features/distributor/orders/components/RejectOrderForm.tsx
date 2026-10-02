import { useState, type FormEvent } from "react";

// Same limits as the backend's reject payload validation.
const MIN_REASON_LENGTH = 3;
const MAX_REASON_LENGTH = 500;

interface RejectOrderFormProps {
  submitting: boolean;
  onSubmit: (reason: string) => void;
  onCancel: () => void;
}

// A rejection always carries a reason, so the form cannot be sent without one.
const RejectOrderForm = ({
  submitting,
  onSubmit,
  onCancel,
}: RejectOrderFormProps) => {
  const [reason, setReason] = useState("");

  const trimmedReason = reason.trim();
  const isValid = trimmedReason.length >= MIN_REASON_LENGTH;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isValid) onSubmit(trimmedReason);
  };

  return (
    <form className="reject-order-form" onSubmit={handleSubmit}>
      <label htmlFor="reject-reason">Reason for rejection</label>

      <textarea
        id="reject-reason"
        value={reason}
        rows={3}
        maxLength={MAX_REASON_LENGTH}
        required
        autoFocus
        disabled={submitting}
        placeholder="Tell the retailer why this order cannot be fulfilled"
        onChange={(event) => setReason(event.target.value)}
      />

      <div className="order-actions">
        <button
          className="order-action-button is-danger"
          type="submit"
          disabled={submitting || !isValid}
        >
          {submitting ? "Rejecting..." : "Confirm Rejection"}
        </button>

        <button
          className="order-action-button"
          type="button"
          disabled={submitting}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default RejectOrderForm;
