import { useState, useEffect } from "react";
import InputField from "./InputField";
import { IoClose } from "react-icons/io5";

/*
  ! DashboardForm
  --------------------------------------------------
  ? Reusable dynamic form component for dashboard features

  * Used for:
  * - Creating listings
  * - Editing listings
  * - Admin game management
  * - Any form driven by field config

  * Props:
  * - mode ("create" | "edit"): controls button text + behavior
  * - fields (array): dynamic field configuration
  * - initialData (object): pre-filled values for edit mode
  * - onClose (function): closes modal/form
  * - onSubmit (function): returns form data to parent
  * - title (string): form header title
*/

export default function DashboardForm({
  mode = "create",
  fields = [],
  initialData = {},
  onClose,
  onSubmit,
  title = "Form",
}) {
  /*
    ! Build Initial State
    * Converts field config into form state object
    ? Ensures safe fallback for missing values
  */
  const buildInitialState = () => {
    const state = {};

    fields.forEach((field) => {
      state[field.name] = initialData?.[field.name] || "";
    });

    return state;
  };

  /*
    ! Form State
    * Holds all input values dynamically
  */
  const [formData, setFormData] = useState(buildInitialState());

  /*
    ! Sync Form on Edit
    * Updates form when switching between different edit targets
    ? Prevents stale values when reopening modal
  */
  useEffect(() => {
    setFormData(buildInitialState());
  }, [initialData]);

  /*
    ! Handle Input Change
    * Updates state for any field dynamically
  */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
    ! Form Validation
    * Ensures all fields meet their validation rules
    ? Prevents invalid submissions
  */
  const isFormValid = fields.every((field) => field.isValid(formData));

  /*
    ! Handle Submit
    * Sends validated data to parent component
    * Closes form after successful submission
  */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    onSubmit(formData);
    onClose();
  };

  return (
    <div className="form-ctr">
      <form onSubmit={handleSubmit}>
        {/*
          * Header Section
          ? Displays form title + close button
        */}
        <div className="head">
          <h1>{title}</h1>

          {/* Close Form */}
          <button type="button" className="close-btn" onClick={onClose}>
            <IoClose size={22} />
          </button>
        </div>

        {/*
          * Dynamic Fields Section
          ? Renders inputs based on configuration array
        */}
        <ul className="fields-ctr">
          {fields.map((field) => (
            <InputField
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              isValid={field.isValid(formData)}
              inputClass={field.inputClass}
              options={field.options}
            />
          ))}
        </ul>

        {/*
          * Action Buttons
          ? Cancel + Submit controls
        */}
        <ul className="opts-ctr">
          {/* Cancel Button */}
          <li>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </li>

          {/* Submit Button */}
          <li>
            <button type="submit" disabled={!isFormValid}>
              {mode === "create" ? "Create" : "Update"}
            </button>
          </li>
        </ul>
      </form>
    </div>
  );
}
