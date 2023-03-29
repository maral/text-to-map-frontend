import { forwardRef, HTMLProps } from "react";

const SuggestInput = forwardRef<HTMLInputElement, HTMLProps<HTMLInputElement>>(
  (props, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        defaultValue=""
        placeholder="Zadejte adresu"
        className="form-control"
        {...props}
      />
    );
  }
);

SuggestInput.displayName = "SuggestInput";

export default SuggestInput;
