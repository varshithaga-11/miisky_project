

type BackToTopProps = {
  scroll: boolean;
};

export default function BackToTop({ scroll }: BackToTopProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {scroll && (
        <a
          className="scroll-top scroll-to-target d-block"
          href="#top"
          onClick={handleClick}
        >
          <i className="far fa-arrow-up"></i>
        </a>
      )}
    </>
  );
}
