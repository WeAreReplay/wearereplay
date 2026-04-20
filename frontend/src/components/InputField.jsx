import { useState, useRef, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";

/*
  ! InputField 
  --------------------------------------------------
  ? Reusable input field with validation + password toggle support

  * Props:
  * - label (string): field label
  * - name (string): input name/id
  * - type (string): input type (text, password, textarea, radio, file, etc.)
  * - placeholder (string)
  * - value (string | file)
  * - onChange (function)
  * - isValid (boolean): validation state
  * - hint (string): helper text below input
  * - inputClass (string): additional styling class
  * - options (array): radio options (ONLY for radio type)

  * Features:
  * - Validation checkmark
  * - Password show/hide toggle
  * - Radio group
  * - File upload with preview
  * - Optional hint display
*/

export default function InputField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  isValid,
  hint,
  inputClass = "",
  options = [],
  disabled = false,
}) {
  // * Controls password visibility
  const [showPassword, setShowPassword] = useState(false);

  // * File input reference
  const fileRef = useRef(null);

  // * Drag state for file upload
  const [dragActive, setDragActive] = useState(false);

  // * File preview state
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (type === "file" && value && typeof value === "string") {
      setPreview(value);
    }
  }, [value, type]);
  /*
    ! Handle File Selection
    * Creates preview URL + sends file to parent form
  */
  const handleFile = (file) => {
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);

    onChange({
      target: {
        name,
        value: file,
      },
    });
  };

  /*
    ! Handle File Input Change
  */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  /*
    ! Drag Over Handler
  */
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  /*
    ! Drag Leave Handler
  */
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  /*
    ! Drop Handler
  */
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <li className="field">
      {
        // * Input Label
      }
      {type === "radio" ? (
        <legend>{label}</legend>
      ) : (
        <label htmlFor={name}>{label}</label>
      )}

      <div className={`input-ctr ${inputClass}`}>
        {
          // * File Input
        }
        {type === "file" ? (
          <div
            className={`file-ctr ${dragActive ? "active" : ""}`}
            onClick={() => !disabled && fileRef.current?.click()}
            onDragOver={(e) => !disabled && handleDragOver(e)}
            onDragLeave={(e) => !disabled && handleDragLeave(e)}
            onDrop={(e) => !disabled && handleDrop(e)}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              id={name}
              disabled={disabled}
              onChange={handleFileChange}
              onClick={(e) => e.stopPropagation()}
              disabled={disabled}
            />

            {preview ? (
              <img src={preview} alt="preview" className="file-preview" />
            ) : (
              <p className="file-hint">
                Drag & drop image here or click to upload
              </p>
            )}
          </div>
        ) : type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required
            disabled={disabled}
          />
        ) : type === "radio" ? (
          <>
            {
              // ! Loop through radio options
            }
            {options.map((option) => (
              <label
                key={option}
                className={`radio-btn ${value === option ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name={name}
                  value={option}
                  checked={value === option}
                  onChange={onChange}
                  disabled={disabled}
                />

                {
                  // * Radio Text
                }
                {option}
              </label>
            ))}
          </>
        ) : type === "checkbox" ? (
          <>
            {options.map((option) => (
              <label
                key={option}
                className={`radio-btn ${
                  value?.includes(option) ? "selected" : ""
                }`}
              >
                <input
                  type="checkbox"
                  name={name}
                  value={option}
                  checked={value?.includes(option)}
                  onChange={(e) => {
                    if (disabled) return;

                    const checked = e.target.checked;

                    let newValue = Array.isArray(value) ? [...value] : [];

                    if (checked) {
                      newValue.push(option);
                    } else {
                      newValue = newValue.filter((v) => v !== option);
                    }

                    onChange({
                      target: {
                        name,
                        value: newValue,
                      },
                    });
                  }}
                  disabled={disabled}
                />
                {option}
              </label>
            ))}
          </>
        ) : (
          // * Default Input
          <input
            id={name}
            name={name}
            type={type === "password" && showPassword ? "text" : type}
            placeholder={placeholder}
            autoComplete="off"
            value={value}
            onChange={onChange}
            required
            aria-invalid={!isValid}
          />
        )}

        {
          // * Validation Checkmark
        }
        {!disabled &&
          type !== "password" &&
          type !== "file" &&
          type !== "radio" &&
          type !== "checkbox" &&
          isValid && <FaCheck className="icon valid-icon" />}

        {
          // ! Password Toggle Button
        }
        {type === "password" && !disabled && (
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <RiEyeOffFill /> : <RiEyeFill />}
          </button>
        )}
      </div>
      {
        // * Hint
      }
      {hint && (
        <div className="hint-ctr">
          {
            // * Show check if valid
          }
          {isValid && <FaCheck />}

          <p>{hint}</p>
        </div>
      )}
    </li>
  );
}
