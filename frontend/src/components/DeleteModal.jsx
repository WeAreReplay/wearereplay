/*
  ! DeleteModal
  --------------------------------------------------
  ? Confirmation modal for deleting a listing
  ? Prevents accidental deletions by requiring user action

  * Props:
  * - name (string): name of the item being deleted
  * - onConfirm (function): called when delete is confirmed
  * - onCancel (function): called when modal is closed/cancelled
*/

export default function DeleteModal({ name, onConfirm, onCancel }) {
  // * Fallback if name is not provided
  const itemName = name || "This Item";

  return (
    // ! Modal wrapper (should be paired with Overlay component)
    <div className="delete-modal" role="dialog" aria-modal="true">
      {
        // ? Stops clicks inside modal from closing it
        // ! Important if used with overlay click-to-close
      }
      <div className="content" onClick={(e) => e.stopPropagation()}>
        <h3>Confirm Deletion</h3>

        <p>
          Are you sure you want to delete <strong>{itemName}</strong>?
        </p>

        {
          // * Action Buttons
        }
        <ul className="opts-ctr">
          <li>
            {
              // * Cancel Button
            }
            <button className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
          </li>
          <li>
            {
              // * Delete Button
            }
            <button className="delete-btn" onClick={onConfirm}>
              Delete
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
