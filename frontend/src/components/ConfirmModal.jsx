/*
  ! ConfirmModal
  --------------------------------------------------
  ? Generic confirmation modal for any destructive or important action
  ? Supports delete, confirm return, confirm delivery, report, etc.

  * Props:
  * - title (string): modal heading
  * - message (string): main confirmation text
  * - itemName (string): optional highlighted item
  * - confirmText (string): confirm button label
  * - cancelText (string): cancel button label
  * - onConfirm (function): confirm action
  * - onCancel (function): cancel action
*/

export default function ConfirmModal({
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  itemName,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  const displayName = itemName || "this item";

  return (
    // ! Modal wrapper (should be paired with Overlay component)
    <div className="confirm-modal" role="dialog" aria-modal="true">
      <div className="content" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>

        <p>
          {message} {itemName && <strong>{itemName}</strong>}
        </p>

        {
          // * Action Buttons
        }
        <ul className="opts-ctr">
          <li>
            <button className="cancel-btn" onClick={onCancel}>
              {cancelText}
            </button>
          </li>

          <li>
            <button className="confirm-btn" onClick={onConfirm}>
              {confirmText}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
