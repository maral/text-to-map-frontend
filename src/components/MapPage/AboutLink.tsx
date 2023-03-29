export interface AboutLinksProps {
  url: string;
  prependText?: string;
}

export default ({
  url,
  prependText,
  children,
}: React.PropsWithChildren<AboutLinksProps>) => {
  return (
    <li>
      {prependText && (
        <>
          <span>{prependText}</span>{" "}
        </>
      )}
      <a href={url} target="_blank">
        {children}
      </a>
    </li>
  );
};
