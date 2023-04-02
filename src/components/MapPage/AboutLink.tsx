export interface AboutLinksProps {
  href: string;
  prependText?: string;
}

export default function AboutLink({
  href,
  prependText,
  children,
}: React.PropsWithChildren<AboutLinksProps>) {
  return (
    <li>
      {prependText && (
        <>
          <span>{prependText}</span>{" "}
        </>
      )}
      <a href={href} target="_blank">
        {children}
      </a>
    </li>
  );
}
