import { forwardRef, HTMLProps } from "react";

export default forwardRef<HTMLInputElement, HTMLProps<HTMLInputElement>>(
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
