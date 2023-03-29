declare module "kofi-button" {
  import * as React from "react";

  interface KofiButtonProps {
    color?: string;
    kofiID?: string;
    title?: string;
  }

  export default class KofiButton extends React.Component<KofiButtonProps> {}
}
